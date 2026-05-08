// Automatically detects if you are testing on your laptop or if the site is live.
const API_URL = window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' 
    : 'https://refai-backend-l1bp.onrender.com';

window.API_URL = API_URL;
console.log('🔧 RefAI Engine Connected to:', API_URL);
