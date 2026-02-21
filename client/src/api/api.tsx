import axios, {type AxiosInstance } from "axios";

const url = `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}`


export function getApi(baseUrl: string): AxiosInstance  {
    const api = axios.create({
        baseURL:baseUrl
    })
    api.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem("access");
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshToken = localStorage.getItem("refresh");
                    
                    const refreshUrl = `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}/token/refresh/`;
                    
                    console.log("Пытаюсь обновиться по адресу:", refreshUrl);
                    
                    const res = await axios.post(refreshUrl, { refresh: refreshToken });
                    console.log("Refresh response:", res.data);
                    localStorage.setItem("access", res.data.access);
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (err:any) {
                    console.error("REFRESH ERROR:", err.response?.data); 
                    return Promise.reject(err);
                }
            }
            return Promise.reject(error);
        }
    );
    return api;
}