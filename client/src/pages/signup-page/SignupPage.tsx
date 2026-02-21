import { SignupForm } from "../../components/signup-form/SignupForm"
import styles from "./SignupPage.module.css"


export function SignupPage() {
    return (
        <div className={styles.form_container}>
            <SignupForm />
        </div> 
    );
}