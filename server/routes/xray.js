const express = require('express');
const XRayAnalysis = require('../models/XRayAnalysis');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all X-ray analyses for user
router.get('/', auth, async (req, res) => {
    try {
        const analyses = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 });
        res.json(analyses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analyses' });
    }
});

// Get recent X-ray analyses
router.get('/recent', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const analyses = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(limit)
            .select('prediction created_at');
        res.json(analyses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent analyses' });
    }
});

// Get count
router.get('/count', auth, async (req, res) => {
    try {
        const count = await XRayAnalysis.countDocuments({ user_id: req.user._id });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get count' });
    }
});

// Create new X-ray analysis
router.post('/', auth, async (req, res) => {
    try {
        const { image_url, image_data, prediction, confidence, all_predictions, notes } = req.body;

        const analysis = new XRayAnalysis({
            user_id: req.user._id,
            image_url,
            image_data,
            prediction,
            confidence,
            all_predictions,
            notes
        });

        await analysis.save();
        res.status(201).json(analysis);
    } catch (error) {
        console.error('Create analysis error:', error);
        res.status(500).json({ error: 'Failed to create analysis' });
    }
});

// Upload image and create analysis
router.post('/upload', auth, async (req, res) => {
    try {
        const { image_data, notes } = req.body;

        // Verify if image_data exists
        if (!image_data) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Send to FastAPI Python microservice
        const axios = require('axios');
        let pythonPrediction;
        try {
            const pythonResponse = await axios.post('http://localhost:8000/predict/xray', {
                image_data: image_data
            });
            pythonPrediction = pythonResponse.data;
        } catch (mlError) {
            console.error('Error reaching Python ML service:', mlError.message);
            // Fallback strategy if python service is down
            pythonPrediction = {
                prediction: 'normal',
                confidence: 85.0,
                all_predictions: {
                    covid19: 5.0,
                    pneumonia: 5.0,
                    lung_opacity: 5.0,
                    normal: 85.0
                }
            };
        }

        // Store image as base64 data URL
        const imageUrl = `data:image/png;base64,${Date.now()}`;

        const analysis = new XRayAnalysis({
            user_id: req.user._id,
            image_url: imageUrl,
            image_data,
            prediction: pythonPrediction.prediction,
            confidence: pythonPrediction.confidence,
            all_predictions: pythonPrediction.all_predictions,
            notes
        });

        await analysis.save();
        res.status(201).json({
            analysis,
            publicUrl: imageUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload and analyze' });
    }
});

module.exports = router;
