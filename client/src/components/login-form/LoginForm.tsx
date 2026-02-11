import { useState, useContext  } from "react"
import React from "react"
import { useNavigate } from "react-router";
import styles from "./LoginForm.module.css"
import axios from "axios"
import {getApi} from "../../api/api"

import { AuthContext } from "../../api/authContext"; // Путь к твоему файлу с контекстом



interface LoginRespons {
    access: string,
    refresh: string
}



export function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const { loginSuccess } = useContext(AuthContext)!; 
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}/token/`, {
            email: email,      // Твой стейт email
            password: password  // Твой стейт password
        });
            localStorage.setItem("access", res.data.access)
            localStorage.setItem("refresh", res.data.refresh)
            
            const apiInstance = getApi(import.meta.env.VITE_API_URL)
            const meIdentification = await apiInstance.get(`${import.meta.env.VITE_APP_EMPLOYEE}/me/`);
            
            loginSuccess(meIdentification.data); 
        
            navigate("/");
        } catch (error: any) {
            console.log("STATUS:", error?.response?.status);
            console.log("DATA:", error?.response?.data);
        }
        
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
                
            <button type="submit">Login</button>
        </form>
    )
}