// Abstract API service (Dependency Inversion Principle)
const airQualityService = {
    async getAirQuality(lat, lon) {
        const apiKey = "b61bd157-7f56-422a-bea6-5b8db55dfb7f";
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.data?.message === "city_not_found") {
                throw new Error("No air quality data available for this location.");
            }
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        if (!data.data?.current?.pollution?.aqius) {
            throw new Error("AQI data not found in response");
        }
        return data.data.current.pollution.aqius;
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
        if (error.message.includes("No air quality data available")) {
            document.getElementById("fallback").style.display = "block";
        } else {
            alert(`Error: ${error.message}`);
        }
    }
});