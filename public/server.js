const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.post('/api/status', (req, res) => {
    res.json({ status: 'ONLINE', timestamp: Date.now() });
});

// Proxy endpoint for Gemini/OpenRouter if needed to hide keys in future
app.post('/api/chat', async (req, res) => {
    // Implementation for server-side API calls would go here
    // For now, the frontend handles the direct connection as per the prototype
    res.status(501).json({ message: "Proxy not implemented yet. Use client-side key." });
});

// Serve React App in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));