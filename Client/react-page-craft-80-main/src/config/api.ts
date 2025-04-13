// Production API URL
export const API_BASE_URL = 'https://offline-upi-backend.vercel.app';

// Development API URL (uncomment this and comment the production URL when testing locally)
// export const API_BASE_URL = 'http://localhost:8080';

// MediaStack API Configuration
export const MEDIASTACK_API = {
    BASE_URL: 'https://api.mediastack.com/v1',
    ACCESS_KEY: '93074874edf9c762ce948a83830a3505',
    ENDPOINTS: {
        NEWS: '/news'
    }
};

// API endpoints for backend
export const API_ENDPOINTS = {
    LOGIN: '/api/users/validate',
    REGISTER: '/api/users/register',
    UPDATE_NAME: '/api/users/update-name',
    UPDATE_PIN: '/api/users/update-pin',
    BALANCE: '/api/users/Balance',
    TRANSFER: '/api/users/transfer',
    HISTORY: '/api/users/history'
}; 