
import styles from "./footer.module.css"


export function Footer () {    
    const res: string[]= [":/ZURA"];
    const isLoggedIn = false;
    if (isLoggedIn) {
        res.push("Boris Isac")
    } else {
        res.push("GhostMode")
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
                    <span>Beta V1.0</span>
                </div>                   
            </div>
        </div>
            
    )
};
