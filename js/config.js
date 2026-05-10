// DO NOT PUT YOUR POSTGRESQL LINK HERE!
const API_URL = 'https://refai-backend.onrender.com'; // Use your actual Render URL here

window.API_URL = API_URL;

// --- DEV MODE: AUTO-INJECT IDs TO FIX YOUR "MISSING ID" ERRORS ---
// Because you haven't logged in properly through the backend yet, your browser memory is empty.
// This script automatically injects fake IDs so you can test the pages without getting kicked out!
if (!localStorage.getItem('leagueId')) localStorage.setItem('leagueId', '1');
if (!localStorage.getItem('teamId')) localStorage.setItem('teamId', '1');
if (!localStorage.getItem('userId')) localStorage.setItem('userId', '1');
if (!localStorage.getItem('token')) localStorage.setItem('token', 'test_token');
