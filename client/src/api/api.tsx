import axios, {type AxiosInstance } from "axios";



export function getApi(url: string): AxiosInstance  {
    const api = axios.create({
        baseURL:url
    })
    api.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem("access");
            const refreshToken = localStorage.getItem("refresh");
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            console.log("Interceptor отправил заголовок:", config.headers.Authorization);
            return config;
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    return api;
}