// Automatically detects if you are testing on your laptop or if the site is live.
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' 
    : 'https://api.refai.com.ng'; // Replace with your actual live backend URL later

window.API_URL = API_URL;
console.log('🔧 RefAI Engine Connected to:', API_URL);