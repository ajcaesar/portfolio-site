const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    const symbol = 'BKNG';
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching stock price:', error);
        res.status(500).json({ error: 'Error fetching stock price' });
    }
};
