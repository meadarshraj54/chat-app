import axios from 'axios';

export const baseURL = 'http://localhost:8080';

const httpClient = axios.create({
    baseURL: baseURL,
});

export default httpClient;