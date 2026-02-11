import React, { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { getApi } from "./api";
import type { Employeer } from "./authContext";

const baseURL = import.meta.env.VITE_API_URL;
const api = getApi(baseURL); 


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Employeer | null>(null);
    const [loading, setLoading] = useState(true);
    const loginSuccess = (userData: Employeer) => {
        console.log('++++++',userData);
        setUser(userData);
        setLoading(false);
    };


    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("access");
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get(`${import.meta.env.VITE_APP_EMPLOYEE}/me/`); 
                
                if (res.data) {
                    setUser(res.data);
                    console.log(res.data);
                    
                }
            } catch (error) {
                console.error("Auth init failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []); 
    return (
        <AuthContext.Provider value={{ user, loading , loginSuccess}}>
            {/* Если loading = true, тут можно показать спиннер, но пока отдаем детей */}
            {children}
        </AuthContext.Provider>
    );
};
