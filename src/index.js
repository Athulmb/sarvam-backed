"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const ai_1 = __importDefault(require("./routes/ai"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://athulmb66_db_user:3AGrgC09au78MTql@cluster0.crresnz.mongodb.net/bmntech';
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/ai', ai_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'BMNTech Backend API', db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map