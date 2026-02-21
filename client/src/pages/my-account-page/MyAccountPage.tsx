import { MyAccountForm } from "../../components/account-form/MyAccountForm"
import styles from "./MyAccountPage.module.css"
export function MyAccountPage() {
    return (
        <div className={styles.form_container}>
            <MyAccountForm />
        </div> 
    )
}