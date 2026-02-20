import styles from "./MyAccountForm.module.css"
import axios from "axios"
import {useEffect, useState} from "react";

interface MyDataForm {
    email: string,
    first_name?: string| null,
    last_name?: string| null,
    is_staff?: boolean| null,
    is_employee?: boolean| null,
    phone?:string| null,
    role?: string| null,
}

interface ChangePasswordForm {
    current_password: string,
    password: string,
    confirm_password: string,
}

export function MyAccountForm() {
    const [myData, setMyData] = useState<MyDataForm | null>(null);
    console.log('MyData==>',myData);
    

    useEffect(() => {
        const fetchMyData = async() =>{
            const token = localStorage.getItem("access");
            const res =await axios.get(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}/my_account/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('----->',res.data);
            setMyData(res.data);
        } 
        
        fetchMyData();
    }, []);

    return (
        <form className={styles.form}>
            <h3 className={styles.form_title}>{myData?.email} account</h3>
            
            <p className={styles.form_paragraf}>
                <label htmlFor="email_input">Email</label>
                <input 
                    id="email_input"
                    type="email"  
                    placeholder="Email"
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    value={myData?.email || ""}
                    required 
                />
            </p>
            
            <p className={styles.form_paragraf}>
                <label htmlFor="first_name_input">First Name</label>
                <input 
                    id="first_name_input"
                    type="text"  
                    placeholder="Insert First Name"
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    value={myData?.first_name || ""}
                    required 
                />
            </p>

            <p className={styles.form_paragraf}>
                <label htmlFor="last_name_input">Last Name</label>
                <input 
                    id="last_name_input"
                    type="text"  
                    placeholder="Insert Last Name"
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    value={myData?.last_name || ""}
                    required 
                />
            </p>

            <p className={styles.form_paragraf}>
                <label htmlFor="phone_input">Phone</label>
                <input 
                    id="phone_input"
                    type="text"  
                    placeholder="Insert Phone"
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    value={myData?.phone || ""}
                    required 
                />
            </p>

            <p className={styles.form_paragraf}>
                <label htmlFor="role_input">Role</label>
                <input 
                    id="role_input"
                    type="text"  
                    placeholder="Insert Role"
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    value={myData?.role || ""}
                    required 
                />
            </p>



            <p className={styles.form_paragraf}>
                <label htmlFor="is_staff_input">Is Staff</label>
                <input 
                    id="is_staff_input"
                    type="checkbox"  
                    placeholder="Is Staff"
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    checked={myData?.is_staff || false}
                />
            </p>

            <p className={styles.form_paragraf}>
                <label htmlFor="is_employee_input">Is Employee</label>
                <input 
                    id="is_employee_input"
                    type="checkbox"  
                    /*onChange={(e) => setEmail(e.target.value)}*/
                    checked={myData?.is_employee || false}
                />
            </p>
            <p className={styles.form_paragraf}>
                <a href="#">Forget password</a>
                <a href="#">Change password</a>
            </p>

            <button type="submit">Update my Data</button>
        </form>
    );
}