import { useState } from "react"
import React from "react"
import styles from "./LoginForm.module.css"




export function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        console.log('============',e);
        console.log("Data ready to send");
        console.log("email: ", email);
        console.log("pass: ", password);
    }
    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.form_title}>Login Form</h3>
            <p>
                <input 
                    type="email"  
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
            </p>
            <p>
                <input 
                    type="password" 
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                />
            </p>
            <button type="submit">Login</button>
        </form>
    )
}