// Abstract API service (Dependency Inversion Principle)
const airQualityService = {
    async getAirQuality(lat, lon) {
        const apiKey = "b61bd157-7f56-422a-bea6-5b8db55dfb7f";
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${await response.text()}`);
            }
            const data = await response.json();
            console.log("API Response:", data); // Debug the response
            if (!data.data?.current?.pollution?.aqius) {
                throw new Error("AQI data not found in response");
            }
            return data.data.current.pollution.aqius;
        } catch (error) {
            throw new Error(`Failed to fetch air quality data: ${error.message}`);
        }
    }
};

// Function to get user's location (Single Responsibility Principle)
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }),
            (error) => reject(error)
        );
    });
}

// Function to map AQI to a health recommendation (Single Responsibility Principle)
function getRecommendation(aqi) {
    if (aqi <= 50) return "Good: Safe for all activities.";
    if (aqi <= 100) return "Moderate: Fine for most, but sensitive groups should be cautious.";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups: Limit outdoor activities.";
    if (aqi <= 200) return "Unhealthy: Avoid prolonged outdoor activities.";
    return "Hazardous: Stay indoors.";
}

// Function to update the UI (Single Responsibility Principle)
function updateUI({ lat, lon, aqi, recommendation }) {
    document.getElementById("location").textContent = `Location: Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
    document.getElementById("aqi").textContent = `AQI: ${aqi}`;
    document.getElementById("recommendation").textContent = `Recommendation: ${recommendation}`;
}

// Main logic to tie it all together
document.getElementById("check-air-quality").addEventListener("click", async () => {
    try {
        // Get user location
        const { lat, lon } = await getUserLocation();
        
        // Fetch air quality data
        const aqi = await airQualityService.getAirQuality(lat, lon);
        
        // Get recommendation
        const recommendation = getRecommendation(aqi);
        
        // Update UI
        updateUI({ lat, lon, aqi, recommendation });
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});