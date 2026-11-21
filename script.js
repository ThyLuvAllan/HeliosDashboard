
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-database.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDfi41duj529CgHwqziqniGBbX9KbqX_2M",
  authDomain: "helios-57262.firebaseapp.com",
  databaseURL: "https://helios-57262-default-rtdb.firebaseio.com",
  projectId: "helios-57262",
  storageBucket: "helios-57262.firebasestorage.app",
  messagingSenderId: "209334160232",
  appId: "1:209334160232:web:bcdc5a9c4f1e01187ca4dd",
  measurementId: "G-YVCPQ6ET7L"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

// ============================================
// FIREBASE AUTHENTICATION
// ============================================

const authStatus = document.getElementById("authStatus");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

// SIGN IN
// SIGN IN
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    authStatus.textContent = "Enter your email and password.";
    return;
  }

  loginButton.disabled = true;
  authStatus.textContent = "Signing in...";

  try {

    await signInWithEmailAndPassword(auth, email, password);

    loginPassword.value = "";

  } catch (error) {

    console.error("Login error:", error);
    authStatus.textContent = "Sign-in failed: " + error.code;

  } finally {

    loginButton.disabled = false;

  }

});
// SIGN OUT
logoutButton.addEventListener("click", async function () {

  try {

    await signOut(auth);

  } catch (error) {

    console.error("Sign-out error:", error);
    authStatus.textContent = "Sign-out failed.";

  }

});

// AUTHENTICATION STATE
onAuthStateChanged(auth, (user) => {

  if (user) {

    authStatus.textContent =
      "Signed in: " + user.email;

    loginButton.hidden = true;
    loginEmail.hidden = true;
    loginPassword.hidden = true;
    logoutButton.hidden = false;

    console.log("HELIOS authenticated UID:", user.uid);

  } else {

    authStatus.textContent = "Not signed in";

    loginButton.hidden = false;
    loginEmail.hidden = false;
    loginPassword.hidden = false;
    logoutButton.hidden = true;

  }

});

// ============================================
// DASHBOARD ELEMENTS
// ============================================

// WEATHER
const locationInput = document.getElementById("locationInput");
const locationButton = document.getElementById("locationButton");
const selectedLocation = document.getElementById("selectedLocation");
const outsideTemp = document.getElementById("outsideTemp");
const outsideHumidity = document.getElementById("outsideHumidity");
const cloudCover = document.getElementById("cloudCover");
const solarRadiation = document.getElementById("solarRadiation");
const daylightStatus = document.getElementById("daylightStatus");
const lightingRecommendation = document.getElementById("lightingRecommendation");

// LIGHTING
const lightButton = document.getElementById("lightButton");
const lightStatus = document.getElementById("lightStatus");
const hourlySavings = document.getElementById("hourlySavings");
const dailySavings = document.getElementById("dailySavings");
const monthlySavings = document.getElementById("monthlySavings");
const totalMoneySaved = document.getElementById("totalMoneySaved");

// ROBOT
const robotStatus = document.getElementById("robotStatus");
const robotLocation = document.getElementById("robotLocation");
const robotSpeed = document.getElementById("robotSpeed");
const robotHeading = document.getElementById("robotHeading");
const robotBattery = document.getElementById("robotBattery");
const robotVoltage = document.getElementById("robotVoltage");
const firebaseStatus = document.getElementById("firebaseStatus");

// ============================================
// ENERGY SETTINGS
// ============================================

const LIGHT_WATTS = 60;
const ELECTRICITY_RATE = 0.15;

let lightsOn = true;

// ============================================
// LOCATION BUTTON
// ============================================

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

// ============================================
// GEOCODING
// ============================================

async function findLocation(city) {

  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

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

// ============================================
// WEATHER
// ============================================

async function getWeather(latitude, longitude) {

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,cloud_cover,shortwave_radiation,is_day&temperature_unit=fahrenheit`;

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

  outsideTemp.textContent = temperature;
  outsideHumidity.textContent = humidity;
  cloudCover.textContent = clouds;
  solarRadiation.textContent = radiation;

  daylightStatus.textContent =
    isDay === 1 ? "Daylight" : "Night";

  if (isDay === 1 && radiation >= 300 && clouds < 50) {

    lightingRecommendation.textContent =
      "Daylight may be sufficient; check indoor brightness";

  } else {

    lightingRecommendation.textContent =
      "Check indoor lighting needs";

  }

}

// ============================================
// LIGHT BUTTON
// ============================================

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

// ============================================
// ENERGY SAVINGS
// ============================================

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

  totalMoneySaved.textContent = monthly.toFixed(2);

}

// ============================================
// FIREBASE ROBOT LISTENER
// ============================================

// Expected Firebase data at /robot:
//
// {
//   status: "Online",
//   location: {
//     x: 0,
//     y: 0,
//     heading: 0
//   },
//   speed: 0,
//   batteryPercent: 0,
//   batteryVoltage: 0
// }

const robotRef = ref(database, "robot");

onValue(

  robotRef,

  (snapshot) => {

    firebaseStatus.textContent = "Connected";

    const robot = snapshot.val();

    if (!robot) {

      robotStatus.textContent = "Waiting for robot data";
      robotLocation.textContent = "--";
      robotSpeed.textContent = "--";
      robotHeading.textContent = "--";
      robotBattery.textContent = "--";
      robotVoltage.textContent = "--";

      return;

    }

    robotStatus.textContent = robot.status ?? "Unknown";

    if (robot.location && typeof robot.location === "object") {

      const x = robot.location.x ?? "--";
      const y = robot.location.y ?? "--";

      robotLocation.textContent = `X: ${x}, Y: ${y}`;

      robotHeading.textContent =
        robot.location.heading ?? "--";

    } else {

      robotLocation.textContent =
        robot.location ?? "--";

      robotHeading.textContent =
        robot.heading ?? "--";

    }

    robotSpeed.textContent = robot.speed ?? "--";
    robotBattery.textContent = robot.batteryPercent ?? "--";
    robotVoltage.textContent = robot.batteryVoltage ?? "--";

  },

  (error) => {

    console.error("Firebase read error:", error);

    firebaseStatus.textContent = "Access denied / Error";
    robotStatus.textContent = "Unavailable";

  }

);

// ============================================
// INITIALIZE DASHBOARD
// ============================================

calculateSavings();
