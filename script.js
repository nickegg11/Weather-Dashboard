const apiKey = 'YOUR_API_KEY'; // Replace with your actual OpenWeather API key

function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Process the forecast data
      console.log(data);
    })
    .catch(error => {
      console.error('Error fetching the forecast:', error);
    });
}

// Example usage:
// getForecast(40.7128, -74.0060); // Replace with actual latitude and longitude
