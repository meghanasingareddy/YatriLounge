import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Accept': 'application/json' },
});

// ===== Data Ingestion =====
export const uploadFlights = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/flights', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const uploadLoungeEntries = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/lounge-entries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ===== Predictions =====
export const trainModel = () => api.post('/predict/train');
export const getForecast = (startTime) => {
    const params = {};
    if (startTime) params.start_time = startTime;
    return api.get('/predict/forecast', { params });
};
export const getMetrics = () => api.get('/predict/metrics');

// ===== Recommendations =====
export const getStaffing = () => api.get('/recommendations/staffing');
export const getMenu = () => api.get('/recommendations/menu');

// ===== Simulation =====
export const simulateAddFlight = (flight) =>
    api.post('/simulate/add-flight', flight);

// ===== Export =====
export const exportPDF = () =>
    api.get('/export/pdf', { responseType: 'blob' });

// ===== Historical Analysis =====
export const getHistoricalAnalysis = (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/analysis/historical', { params });
};

export default api;
