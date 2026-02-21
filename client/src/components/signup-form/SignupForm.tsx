import  styles  from "./SignupForm.module.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';


interface Employee {
    email: string,
    password: string,
    password_confirm: string,
    is_seo_user?: boolean,
    companyName?: string
}



export function SignupForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Employee>({
        email:"",
        password:"",
        password_confirm:"",
        is_seo_user: false,
        companyName:""
    })

    const signupMutation = useMutation({
        mutationFn: async (data: Employee) => {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}/new_employeer/`, data);
            return res.data;
        },
        onSuccess: () => {
            navigate("/login");
        },
        onError: (error: any) => {
            if (error.response) {
                if (typeof error.response.data === 'object') {
                    setFieldErrors(error.response.data);
                } else {
                    setServerError("Server error occurred.");
                }
            } else {
                setServerError("Network error. Please try again.");
            }
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const {name, value, type, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type==="checkbox" ? checked: value
        }));
    
    }

    console.log(serverError);
    
    
    const handleSubmit = async (e: React.FormEvent) => {
        
        e.preventDefault()
        setFieldErrors(null)
        
        if (formData.password !== formData.password_confirm) {
            alert("Password does not match");
            return;
        }
        signupMutation.mutate(formData); 
    };


    return (
        <>
            <form className={styles.form} action="" onSubmit={handleSubmit}>
                <h3 className={styles.form_title}>SignUp</h3>
                {serverError && <p className={styles.error_main}>{serverError}</p>}
                    <p className={styles.form_paragraf}>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="text" name="email" value={formData.email} onChange={handleChange} />
                    </p>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange}/>
                    </p>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="password_confirm">Password confirmation</label>
                        <input id="password_confirm" type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange}/>
                    </p>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="is_seo_user">Is Seo</label>
                        <input 
                            id="is_seo_user"
                            name="is_seo_user"
                            checked={formData.is_seo_user}
                            type="checkbox" 
                            onChange={handleChange}
                        />
                    </p>

                    {formData.is_seo_user && (
                        <p className={styles.form_paragraf}>
                            <label htmlFor="companyName">Company Name</label>
                            <input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleChange} placeholder="Inserte company name. Name is unique" />
                        </p>
                    )} 
                    
                    {fieldErrors && (
                        <div className={styles.error_container}>
                            {Object.entries(fieldErrors).map(([field, errors]) => (
                                <div key={field} style={{ marginBottom: '8px' }}>
                                    {/* Имя поля (делаем первую букву заглавной) */}
                                    <strong className={styles.error_title}>
                                        {field}:
                                    </strong>
                                    {/* Список ошибок для этого поля */}
                                    {Array.isArray(errors) ? (
                                        errors.map((msg, i) => (
                                            <p key={i} className={styles.error_text}>
                                                {msg}
                                            </p>
                                        ))
                                    ) : (
                                        <p className={styles.error_text}>{errors}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" disabled={signupMutation.isPending}>SignUp</button>
            </form>
        </>
    );
}