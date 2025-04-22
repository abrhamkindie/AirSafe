const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const IQAIR_API_KEY = 'b61bd157-7f56-422a-bea6-5b8db55dfb7f';
    const url = `http://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&key=${IQAIR_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json([{
        lat: data.data.location.coordinates[1],
        lon: data.data.location.coordinates[0],
        name: `${data.data.city}, ${data.data.state}, ${data.data.country}`
      }]);
    } else {
      return res.status(500).json({ error: data.data.message || 'Failed to fetch city data' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; 