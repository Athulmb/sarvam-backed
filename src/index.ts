import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import aiRoutes from './routes/ai';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://athulmb66_db_user:3AGrgC09au78MTql@cluster0.crresnz.mongodb.net/bmntech';
mongoose.connect(mongoUri)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'BMNTech Backend API', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

