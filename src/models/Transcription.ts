import mongoose from 'mongoose';

const transcriptionSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    language: { type: String, default: 'auto' },
    text: { type: String, required: true },
    processingTime: { type: Number },
    segments: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transcription', transcriptionSchema);
