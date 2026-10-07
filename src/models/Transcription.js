"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transcriptionSchema = new mongoose_1.default.Schema({
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    language: { type: String, default: 'auto' },
    text: { type: String, required: true },
    processingTime: { type: Number },
    segments: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Transcription', transcriptionSchema);
//# sourceMappingURL=Transcription.js.map