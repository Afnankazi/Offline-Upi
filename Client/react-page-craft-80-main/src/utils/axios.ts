import axios from 'axios';
import { API_BASE_URL, MEDIASTACK_API } from '../config/api';

// Backend API instance
const backendApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// MediaStack API instance
const newsApi = axios.create({
    baseURL: MEDIASTACK_API.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    params: {
        access_key: MEDIASTACK_API.ACCESS_KEY,
        sources: 'business',
        limit: 5
    }
});

// Add request interceptor for backend API
backendApi.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for backend API
backendApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized
                    break;
                case 403:
                    // Handle forbidden
                    break;
                case 404:
                    // Handle not found
                    break;
                default:
                    // Handle other errors
                    break;
            }
        }
        return Promise.reject(error);
    }
);

// Add response interceptor for news API
newsApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('News API Error:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export { backendApi, newsApi }; 