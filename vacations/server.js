const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// API endpoint to serve vacation data
app.get('/vacations', (req, res) => {
    try {
        const vacationsData = fs.readFileSync(path.join(__dirname, 'vacations.js'), 'utf8');
        // Handle any potential BOM characters or other issues
        const cleanData = vacationsData.replace(/^\uFEFF/, '');
        
        // Add explicit error handling for JSON parsing
        try {
            const parsedData = JSON.parse(cleanData);
            res.json(parsedData);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Invalid JSON format in vacations data' });
        }
    } catch (error) {
        console.error('Error reading vacations data:', error);
        res.status(500).json({ error: 'Failed to load vacation data', details: error.message });
    }
});

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'vacations.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
