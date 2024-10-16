const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/weatherDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Define a Mongoose schema for weather
const weatherSchema = new mongoose.Schema({
  temp: Number,
  feels_like: Number,
  temp_min: Number,
  temp_max: Number,
  pressure: Number,
  humidity: Number,
  sea_level: Number,
  grnd_level: Number,
  // Add other fields as needed
});


// Create a Mongoose model
const Weather = mongoose.model('Weather', weatherSchema);

// API route to get weather data and save it to MongoDB
app.get('/save-weather', async (req, res) => {
  try {
    const apiKey = '475c23b4b7c72cb5859a5294d5bb55e6';  // Your OpenWeatherMap API key
    const city = req.query.city;  // Get the city from query parameter
    
    // Check if city is provided in the query
    if (!city) {
      return res.status(400).json({ error: 'Please provide a city name' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    // Fetch weather data
    const response = await axios.get(weatherUrl);
    
    // Extract the 'weather' and 'main' data from the response
    const mainData = response.data.main; // Extract only the first weather object
    // Extract main weather data

    // Create a new weather document from the fetched data
    const newWeather = new Weather({
      temp: mainData.temp,
      feels_like: mainData.feels_like,
      temp_min: mainData.temp_min,
      temp_max: mainData.temp_max,
      pressure: mainData.pressure,
      humidity: mainData.humidity,
      sea_level: mainData.sea_level,
      grnd_level: mainData.grnd_level,
      // Add other fields as needed
    });

    // Save the weather data to MongoDB
    await newWeather.save();

    res.json({
      message: 'Weather data saved successfully!',
      main: newWeather
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch or save weather data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
