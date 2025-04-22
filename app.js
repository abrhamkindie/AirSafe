// Abstract API service (Dependency Inversion Principle)
const airQualityService = {
    async getAirQuality(lat, lon) {
        const url = `/api/get-air-quality?lat=${lat}&lon=${lon}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        if (!data.list?.[0]?.main?.aqi) {
            throw new Error("AQI data not found in response");
        }
        return data.list[0].main.aqi;
    },
    async getCoordinatesByCity(city) {
        const url = `/api/get-coordinates?city=${encodeURIComponent(city)}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        if (!data[0]?.lat || !data[0]?.lon) {
            throw new Error("City not found");
        }
        return { lat: data[0].lat, lon: data[0].lon, location: data[0].name };
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
function updateUI({ lat, lon, aqi, recommendation, location }) {
    document.getElementById("location").textContent = location ? `Location: ${location}` : `Location: Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
    document.getElementById("aqi").textContent = `AQI: ${aqi}`;
    document.getElementById("recommendation").textContent = `Recommendation: ${recommendation}`;
}

// Main logic for current location
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

// Main logic for city search
document.getElementById("check-city-air-quality").addEventListener("click", async () => {
    try {
        // Reset UI
        document.getElementById("fallback").style.display = "none";
        document.getElementById("location").textContent = "Location: Waiting...";
        document.getElementById("aqi").textContent = "AQI: Not checked yet";
        document.getElementById("recommendation").textContent = "Recommendation: Not available";

        const city = document.getElementById("city-input").value.trim();
        if (!city) throw new Error("Please enter a city name.");

        // Get coordinates for the city
        const { lat, lon, location } = await airQualityService.getCoordinatesByCity(city);
        
        // Fetch air quality data
        const aqi = await airQualityService.getAirQuality(lat, lon);
        
        // Get recommendation
        const recommendation = getRecommendation(aqi);
        
        // Update UI
        updateUI({ lat, lon, aqi, recommendation, location });
    } catch (error) {
        if (error.message.includes("City not found") || error.message.includes("AQI data not found")) {
            document.getElementById("fallback").style.display = "block";
        } else {
            alert(`Error: ${error.message}`);
        }
    }
});