// Abstract API service (Dependency Inversion Principle)
const airQualityService = {
    async getAirQuality(lat, lon) {
        const apiKey = "df5c6553925d29ccf14abf65c90f7402"; // Replace with your OpenWeatherMap key
        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${await response.text()}`);
        }
        const data = await response.json();
        if (!data.list?.[0]?.main?.aqi) {
            throw new Error("AQI data not found in response");
        }
        return data.list[0].main.aqi; // AQI on a scale of 1–5
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
    if (aqi === 1) return "Good: Safe for all activities.";
    if (aqi === 2) return "Moderate: Fine for most, but sensitive groups should be cautious.";
    if (aqi === 3) return "Unhealthy for Sensitive Groups: Limit outdoor activities.";
    if (aqi === 4) return "Unhealthy: Avoid prolonged outdoor activities.";
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
        // Reset UI
        document.getElementById("fallback").style.display = "none";
        document.getElementById("location").textContent = "Location: Waiting...";
        document.getElementById("aqi").textContent = "AQI: Not checked yet";
        document.getElementById("recommendation").textContent = "Recommendation: Not available";

        // Get user location
        const { lat, lon } = await getUserLocation();
        
        // Fetch air quality data
        const aqi = await airQualityService.getAirQuality(lat, lon);
        
        // Get recommendation
        const recommendation = getRecommendation(aqi);
        
        // Update UI
        updateUI({ lat, lon, aqi, recommendation });
    } catch (error) {
        if (error.message.includes("AQI data not found")) {
            document.getElementById("fallback").style.display = "block";
        } else {
            alert(`Error: ${error.message}`);
        }
    }
});