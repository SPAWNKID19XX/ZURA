import { useState, useContext  } from "react"
import React from "react"
import { useNavigate } from "react-router";
import styles from "./LoginForm.module.css"
import axios from "axios"
import {getApi} from "../../api/api"
import { AuthContext } from "../../api/authContext"; 
import { useMutation } from '@tanstack/react-query';


interface LoginRespons {
    access: string,
    refresh: string
}



export function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const { loginSuccess } = useContext(AuthContext)!; 

    const loginMutation = useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            const res = await axios.post<LoginRespons>(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}/token/`, credentials);
            return res.data;
        },
        onSuccess: async (data) => {
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            
            const apiInstance = getApi(import.meta.env.VITE_API_URL);
            const meIdentification = await apiInstance.get(`${import.meta.env.VITE_APP_EMPLOYEE}/my_account/`);
            
            loginSuccess(meIdentification.data); 
            navigate("/");
        },
        onError: (error: any) => {
            console.log("STATUS:", error?.response?.status);
            console.log("DATA:", error?.response?.data);
            alert( error?.response?.data?.detail || "Login failed. Please check your credentials and try again." );
        }
    });
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        loginMutation.mutate({ email, password });
        
    }


    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.form_title}>Login Form</h3>
            
            <p className={styles.form_paragraf}>
                <label htmlFor="email_input">Email</label>
                <input 
                    id="email_input"
                    type="email"  
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required 
                />
            </p>
            
            <p className={styles.form_paragraf}>
                <label htmlFor="password_input">Password</label>
                <input 
                    id="password_input"
                    type="password" 
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required 
                />
            </p>
                
            <button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
        </form>
    )
}