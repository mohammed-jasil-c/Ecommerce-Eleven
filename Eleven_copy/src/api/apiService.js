import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY || "access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already tried to refresh for this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem(
                import.meta.env.VITE_REFRESH_TOKEN_KEY || "refresh"
            );

            // No refresh token — clear auth and reject
            if (!refreshToken) {
                localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY || "access");
                localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY || "refresh");
                return Promise.reject(error);
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh/`,
                    { refresh: refreshToken },
                    { withCredentials: true }
                );

                const newAccess = data.access;
                localStorage.setItem(
                    import.meta.env.VITE_AUTH_TOKEN_KEY || "access",
                    newAccess
                );
                // Store new refresh token if returned
                if (data.refresh) {
                    localStorage.setItem(
                        import.meta.env.VITE_REFRESH_TOKEN_KEY || "refresh",
                        data.refresh
                    );
                }

                // Update the header for the original request
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                processQueue(null, newAccess);

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — clear auth
                processQueue(refreshError, null);
                localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY || "access");
                localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY || "refresh");
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
