// Backend API Configuration
export const API_BASE_URL = 'https://offline-upi-backend.vercel.app/api';
// or use your local backend during development
// export const API_BASE_URL = 'http://localhost:8080/api'; 

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
    LOGIN: '/users/validate',
    REGISTER: '/users/register',
    UPDATE_NAME: '/users/update-name',
    UPDATE_PIN: '/users/update-pin',
    BALANCE: '/users/Balance',
    TRANSFER: '/users/transfer',
    HISTORY: '/users/history'
}; 