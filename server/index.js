require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const xrayRoutes = require('./routes/xray');
const symptomsRoutes = require('./routes/symptoms');
const chatRoutes = require('./routes/chat');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/xray', xrayRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
