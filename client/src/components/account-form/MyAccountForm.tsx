import styles from "./MyAccountForm.module.css"
import axios from "axios"
import {useEffect, useState} from "react";

interface MyDataForm {
    email: string | null,
    first_name?: string | null,
    last_name?: string| null,
    is_staff?: boolean| null,
    is_employee?: boolean| null,
    phone?:string| null,
    role?: string| null,
}

interface ChangePasswordInputs {
    current_password: string,
    password: string,
    confirm_password: string,
}

export function MyAccountForm() {
    const [myData, setMyData] = useState<MyDataForm | null>(null);
    const [modalVisible, setmodalVisible] = useState<string | null>(null);
    const [changePasswordData, setChangePasswordData] = useState<ChangePasswordInputs>({
        current_password: "",
        password: "",
        confirm_password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setMyData((prev) => {
        if (!prev) return null; 

        return {
            ...prev,
            [name]: finalValue
        } as MyDataForm; 
    });

    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        setChangePasswordData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    useEffect(() => {
        const fetchMyData = async() =>{
            const token = localStorage.getItem("access");
            const res =await axios.get(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}/my_account/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMyData(res.data);
        } 
        
        fetchMyData();
    }, []);

    return (
        <form className={styles.form}>
            <h3 className={styles.form_title}>{myData?.email} account</h3>
            
            <div className={styles.form_paragraf}>
                <label htmlFor="email_input">Email</label>
                <input 
                    id="email_input"
                    name="email"
                    type="email"  
                    placeholder="Email"
                    onChange={handleChange}
                    value={myData?.email || ""}
                    required 
                />
            </div>
            
            

            <div className={styles.form_paragraf}>
                <label htmlFor="first_name_input">First Name</label>
                <input 
                    id="first_name_input"
                    name="first_name"
                    type="text"  
                    placeholder="Insert First Name"
                    onChange={handleChange}    
                    value={myData?.first_name || ""}
                    required 
                />
            </div>

            <div  className={styles.form_paragraf}>
                <label htmlFor="last_name_input">Last Name</label>
                <input 
                    id="last_name_input"
                    name="last_name"
                    type="text"  
                    placeholder="Insert Last Name"
                    onChange={handleChange}
                    value={myData?.last_name || ""}
                    required 
                />
            </div>

            <div className={styles.form_paragraf}>
                <label htmlFor="phone_input">Phone</label>
                <input 
                    id="phone_input"
                    name="phone"
                    type="text"  
                    placeholder="Insert Phone"
                    onChange={handleChange}
                    value={myData?.phone || ""}
                    required 
                />
            </div>

            <div className={styles.form_paragraf}>
                <label htmlFor="role_input">Role</label>
                <input 
                    id="role_input"
                    name="role"
                    type="text"  
                    placeholder="Insert Role"
                    onChange={handleChange}
                    value={myData?.role || ""}
                    required 
                />
            </div>



            <div className={styles.form_paragraf}>
                <label htmlFor="is_staff_input">Is Staff</label>
                <input 
                    id="is_staff_input"
                    name="is_staff"
                    type="checkbox"  
                    placeholder="Is Staff"
                    onChange={handleChange}
                    checked={myData?.is_staff || false}
                />
            </div>

            <div className={styles.form_paragraf}>
                <label htmlFor="is_employee_input">Is Employee</label>
                <input 
                    id="is_employee_input"
                    type="checkbox"  
                    name="is_employee"
                    onChange={handleChange}
                    checked={myData?.is_employee || false}
                />
            </div>
                <a href="#" onClick={() => setmodalVisible("change_password")} >Change Password</a>
                {modalVisible === "change_password" && (
                    <div className={styles.pass_modal}>
                        <div className={styles.form_pass_modal_paragraf}>
                            <label htmlFor="current_password">Current password</label>
                            <input 
                                id="current_password"
                                name="current_password"
                                type="password"  
                                onChange={handleChangePassword}
                                value={changePasswordData.current_password  || ""}
                            />
                        </div>
                        <div className={styles.form_pass_modal_paragraf}>
                            <label htmlFor="new_password">New password</label>
                            <input 
                                id="new_password"
                                name="password"
                                type="password"  
                                onChange={handleChangePassword}
                                value={changePasswordData.password  || ""}
                            />
                        </div>
                        <div className={styles.form_pass_modal_paragraf}>
                            <label htmlFor="confirm_password">Confirm password</label>
                            <input 
                                id="confirm_password"
                                name="confirm_password"
                                type="password"  
                                onChange={handleChangePassword}
                                value={changePasswordData.confirm_password  || ""}
                            />
                        </div>
                   </div>
                )}
            <button type="submit">Update my Data</button>
        </form>
    );
}