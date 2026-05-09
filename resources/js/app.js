import './bootstrap';
import Alpine from 'alpinejs';
import axios from 'axios';

window.Alpine = Alpine;
window.axios = axios;

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

Alpine.start();

window.api = {
    async post(url, data = {}) {
        const response = await axios.post(url, data);
        return response.data;
    },
    
    async get(url) {
        const response = await axios.get(url);
        return response.data;
    },
    
    async patch(url, data = {}) {
        const response = await axios.patch(url, data);
        return response.data;
    },
    
    async delete(url) {
        const response = await axios.delete(url);
        return response.data;
    },
};