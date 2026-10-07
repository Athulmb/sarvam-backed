"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Transcription_1 = __importDefault(require("../models/Transcription"));
const router = express_1.default.Router();
// Multer config for temporary file storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
// Configure size limit (e.g. from env, default 100MB)
const maxSize = parseInt(process.env.MAX_AUDIO_FILE_SIZE_MB || '100') * 1024 * 1024;
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/webm', 'audio/ogg'];
        // Quick basic check, Whisper handles many formats but we limit to common ones
        if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Unsupported file format. Please upload MP3, WAV, M4A, WebM or OGG.'));
        }
    }
});
router.post('/transcription', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No audio file uploaded.' });
    }
    const { language } = req.body;
    const filePath = req.file.path;
    try {
        // Forward the file to the Whisper Python Service
        const form = new form_data_1.default();
        form.append('file', fs_1.default.createReadStream(filePath));
        if (language && language !== 'auto') {
            form.append('language', language);
        }
        const whisperServiceUrl = process.env.WHISPER_SERVICE_URL || 'http://localhost:8000';
        const response = await axios_1.default.post(`${whisperServiceUrl}/transcribe`, form, {
            headers: {
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        // Delete temp file after successful transmission and processing
        fs_1.default.unlinkSync(filePath);
        // Save to MongoDB
        const transcriptionRecord = new Transcription_1.default({
            fileName: response.data.text.substring(0, 20) + '...', // We can just use originalName here if needed, or save what we have
            originalName: req.file.originalname,
            language: response.data.language,
            text: response.data.text,
            processingTime: response.data.processingTime,
            segments: response.data.segments
        });
        await transcriptionRecord.save();
        return res.json({
            success: true,
            id: transcriptionRecord._id,
            text: response.data.text,
            language: response.data.language,
            processingTime: response.data.processingTime,
            segments: response.data.segments
        });
    }
    catch (error) {
        // Clean up file if there is an error
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        console.error('Transcription API Error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.detail || 'Transcription failed. Whisper service might be unavailable.';
        return res.status(error.response?.status || 500).json({
            success: false,
            error: errorMessage
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map