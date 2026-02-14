import  styles  from "./SignupForm.module.css";


interface Employee {
    email: string,
    password1: string,
    password2: string,
}

export function SignupForm() {
    return (
        <>
            <form className={styles.form} action="">
                <h3 className={styles.form_title}>SignUp</h3>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="text" />
                    </p>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="password1">Password</label>
                        <input id="password1" type="password" />
                    </p>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="password2">Password confirmation</label>
                        <input id="password2" type="password" />
                    </p>
                    <p className={styles.form_paragraf}>
                        <label htmlFor="isSeo">Is Seo</label>
                        <input id="isSeo" type="checkbox" />
                    </p>

                    <button type="submit">SignUp</button>
                
            </form>
        </>
    );
}
