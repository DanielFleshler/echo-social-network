import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
