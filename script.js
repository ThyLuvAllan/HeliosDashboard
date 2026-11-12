
const locationInput = document.getElementById("locationInput");
const locationButton = document.getElementById("locationButton");
const selectedLocation = document.getElementById("selectedLocation");

const outsideTemp = document.getElementById("outsideTemp");
const outsideHumidity = document.getElementById("outsideHumidity");
const totalMoneySaved = document.getElementById("totalMoneySaved");
const cloudCover = document.getElementById("cloudCover");
const solarRadiation = document.getElementById("solarRadiation");
const daylightStatus = document.getElementById("daylightStatus");

const lightingRecommendation =
  document.getElementById("lightingRecommendation");

// LIGHTING CONTROLS
const lightButton = document.getElementById("lightButton");
const lightStatus = document.getElementById("lightStatus");

const hourlySavings = document.getElementById("hourlySavings");
const dailySavings = document.getElementById("dailySavings");
const monthlySavings = document.getElementById("monthlySavings");

// ENERGY SETTINGS
const LIGHT_WATTS = 60;
const ELECTRICITY_RATE = 0.15;

// LIGHT STATE
let lightsOn = true;


// LOCATION BUTTON
locationButton.addEventListener("click", async function () {
  const cityName = locationInput.value.trim();

  if (cityName === "") {
    alert("Please enter a location!");
    return;
  }

  selectedLocation.textContent = "Searching...";

  try {
    await findLocation(cityName);
  } catch (error) {
    console.error(error);
    selectedLocation.textContent = "Location unavailable";
    alert("Unable to retrieve location or weather data.");
  }
});


// GEOCODING FUNCTION
async function findLocation(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Geocoding request failed");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    alert("Location not found!");
    selectedLocation.textContent = "--";
    return;
  }

  const result = data.results[0];

  selectedLocation.textContent =
    `${result.name}, ${result.country}`;

  await getWeather(result.latitude, result.longitude);
}


// WEATHER FUNCTION
async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,cloud_cover,shortwave_radiation,is_day&temperature_unit=fahrenheit`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  const data = await response.json();

  const temperature = data.current.temperature_2m;
  const humidity = data.current.relative_humidity_2m;
  const clouds = data.current.cloud_cover;
  const radiation = data.current.shortwave_radiation;
  const isDay = data.current.is_day;

  // DISPLAY WEATHER
  outsideTemp.textContent = temperature;
  outsideHumidity.textContent = humidity;

  cloudCover.textContent = clouds;
  solarRadiation.textContent = radiation;

  daylightStatus.textContent =
    isDay === 1 ? "Daylight" : "Night";

  // LIGHTING RECOMMENDATION
  if (isDay === 1 && radiation >= 300 && clouds < 50) {
    lightingRecommendation.textContent =
      "Daylight may be sufficient; check indoor brightness";
  } else {
    lightingRecommendation.textContent =
      "Check indoor lighting needs";
  }
}


// LIGHT BUTTON
lightButton.addEventListener("click", function () {
  lightsOn = !lightsOn;

  if (lightsOn) {
    lightStatus.textContent = "ON";
    lightButton.textContent = "Turn Lights OFF";
  } else {
    lightStatus.textContent = "OFF";
    lightButton.textContent = "Turn Lights ON";
  }

  calculateSavings();
});


// ENERGY SAVINGS CALCULATION

function calculateSavings() {
  if (lightsOn) {
    hourlySavings.textContent = "0.000";
    dailySavings.textContent = "0.00";
    monthlySavings.textContent = "0.00";
    totalMoneySaved.textContent = "0.00";
    return;
  }

  const kilowatts = LIGHT_WATTS / 1000;

  const hourly = kilowatts * ELECTRICITY_RATE;
  const daily = hourly * 8;
  const monthly = daily * 30;

  hourlySavings.textContent = hourly.toFixed(3);
  dailySavings.textContent = daily.toFixed(2);
  monthlySavings.textContent = monthly.toFixed(2);

  // Connect the Energy Overview
  totalMoneySaved.textContent = monthly.toFixed(2);
}


// INITIALIZE DASHBOARD
calculateSavings();
