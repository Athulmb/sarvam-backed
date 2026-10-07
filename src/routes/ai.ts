import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import Transcription from '../models/Transcription';

const router = express.Router();

// Multer config for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Configure size limit (e.g. from env, default 100MB)
const maxSize = parseInt(process.env.MAX_AUDIO_FILE_SIZE_MB || '100') * 1024 * 1024;

const upload = multer({ 
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/webm', 'audio/ogg'];
        // Quick basic check, Sarvam AI handles many formats but we limit to common ones
        if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file format. Please upload MP3, WAV, M4A, WebM or OGG.'));
        }
    }
});

import { SarvamAIClient } from 'sarvamai';

router.post('/transcription', upload.single('file'), async (req, res): Promise<any> => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No audio file uploaded.' });
    }

    const { language, model, prompt, title, description } = req.body;
    const filePath = req.file.path;

    try {
        const apiKey = process.env.SARVAM_API_KEY;

        if (!apiKey) {
            fs.unlinkSync(filePath);
            return res.status(500).json({ success: false, error: 'Sarvam API key is missing. Please add SARVAM_API_KEY to your backend .env file.' });
        }
        
        const startTime = Date.now();
        
        // Use Sarvam AI Batch API SDK
        const client = new SarvamAIClient({
            apiSubscriptionKey: apiKey,
        });

        // Create a speech-to-text batch job
        const job = await client.speechToTextJob.createJob({
            model: "saaras:v4",
            languageCode: language && language !== 'auto' ? language : "ml-IN",
            mode: "transcribe",
        });

        // Upload the audio file
        // The SDK expects an array of strings, not an object containing filePaths
        await job.uploadFiles([filePath]);

        // Start processing
        await job.start();

        // Poll until completion
        const status = await job.waitUntilComplete();
        
        if (status.job_state === 'Failed') {
            throw new Error(`Job failed with state: ${status.job_state}`);
        }

        // Download outputs
        const outputDir = path.join(__dirname, '../../uploads/outputs-' + Date.now());
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        await job.downloadOutputs(outputDir);

        // Find and read the output file
        let transcribedText = '[No speech detected]';
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            if (file.endsWith('.txt')) {
                transcribedText = fs.readFileSync(path.join(outputDir, file), 'utf-8');
                break;
            } else if (file.endsWith('.json')) {
                const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
                transcribedText = data.transcript || data.text || transcribedText;
                break;
            }
        }
        
        const processingTime = Number(((Date.now() - startTime) / 1000).toFixed(2));

        // Delete temp files
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }

        // Handle case where Sarvam found no text
        transcribedText = transcribedText.trim() || '[No speech detected]';
        const fileTitle = transcribedText !== '[No speech detected]' 
            ? transcribedText.substring(0, 20) + '...' 
            : req.file.originalname;

        // Save to MongoDB
        const transcriptionRecord = new Transcription({
            fileName: fileTitle,
            originalName: req.file.originalname,
            title: title || fileTitle,
            description: description || '',
            language: language || 'ml-IN',
            text: transcribedText,
            processingTime: processingTime,
            segments: [] 
        });
        await transcriptionRecord.save();

        return res.json({
            success: true,
            id: transcriptionRecord._id,
            text: transcribedText,
            language: language || 'ml-IN',
            processingTime: processingTime,
            segments: []
        });
    } catch (error: any) {
        // Clean up file if there is an error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        console.error('Transcription API Error:', error.response?.data || error.message || error);
        
        const errorMessage = error.response?.data?.message || error.message || 'Transcription failed. Sarvam AI service might be unavailable.';
        
        return res.status(error.response?.status || 500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});
// Fetch all stored transcriptions
router.get('/transcriptions', async (req, res) => {
    try {
        const transcriptions = await Transcription.find().sort({ createdAt: -1 });
        res.json({ success: true, data: transcriptions });
    } catch (error: any) {
        console.error('Fetch Transcriptions Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transcriptions.' });
    }
});

// Fetch a specific transcription by ID
router.get('/transcription/:id', async (req, res) => {
    try {
        const transcription = await Transcription.findById(req.params.id);
        if (!transcription) {
            return res.status(404).json({ success: false, error: 'Transcription not found.' });
        }
        res.json({ success: true, data: transcription });
    } catch (error: any) {
        console.error('Fetch Transcription By ID Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transcription.' });
    }
});
// Update an existing transcription (e.g. text, title, description)
router.put('/transcription/:id', async (req, res) => {
    try {
        const { text, title, description } = req.body;
        const updatedRecord = await Transcription.findByIdAndUpdate(
            req.params.id,
            { text, title, description },
            { new: true }
        );
        if (!updatedRecord) {
            return res.status(404).json({ success: false, error: 'Transcription not found.' });
        }
        res.json({ success: true, data: updatedRecord });
    } catch (error: any) {
        console.error('Update Transcription Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update transcription.' });
    }
});

export default router;
