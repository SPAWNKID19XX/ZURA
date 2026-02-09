import { LoginForm } from "../../components/login-form/LoginForm"
import styles from "./LoginPage.module.css"
export function LoginPage() {
    return (
        <div className={styles.form_container}>
            <LoginForm />
        </div> 
    )
}