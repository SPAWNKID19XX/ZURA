import { useContext } from "react";
import { AuthContext } from "../../api/authContext";
import styles from "./footer.module.css"


export function Footer () {    
    const { user } = useContext(AuthContext)!;
    const res: string[]= [":/ZURA"];
    let userLoged: string = "GhostMode";
    const isLoggedIn = !!user;
    if (isLoggedIn) {
        userLoged = user.email 
        res.push(userLoged)
    } else {
        res.push(userLoged)
    }
    return (
        <div className={styles.full_row_container}>
            <div className={styles.footer}>
                <div className="styles.version_conteiner">
                    <span>Beta V1.0</span>    
                </div>
                <div className={styles.bsh}>
                    <span>{res.join('/')}</span>
                </div>
                <div className={styles.version_conteiner}>
                    <span>User:{userLoged}</span>
                </div>                   
            </div>
        </div>
            
    )
};
