/**
 * RefAI Global Configuration
 * PRODUCTION MODE - No mock data, no fallbacks.
 */

// 1. SET YOUR LIVE BACKEND URL HERE
// Replace this with your exact Render.com URL
const API_URL = 'https://refai-backend-l1bp.onrender.com'; 

window.API_URL = API_URL;

// ========================================================
// 2. GLOBAL API FETCH WRAPPER
// ========================================================
// Automatically attaches the security token to every request
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // If the token is expired/invalid, force the user to log in again
        if (response.status === 401) {
            logout();
            throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('RefAI Fetch Error:', error);
        throw error;
    }
}

// ========================================================
// 3. GLOBAL UI UTILITIES
// ========================================================
function showToast(message, type = 'success') {
    const existing = document.getElementById('refai-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'refai-toast';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 15px 25px; border-radius: 8px; font-weight: bold; color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.3s ease-out;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        border-left: 5px solid rgba(255,255,255,0.5);
    `;
    toast.innerHTML = `${type === 'success' ? '✅' : '⚠️'} ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4000);
}

function logout() {
    localStorage.clear();
    window.location.href = '../pages/login.html';
}

const style = document.createElement('style');
style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
document.head.appendChild(style);
