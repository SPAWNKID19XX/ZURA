import { useState } from "react"
import React from "react"
import styles from "./LoginForm.module.css"




export function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
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