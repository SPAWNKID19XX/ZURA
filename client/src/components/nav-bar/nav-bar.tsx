import logo from "../../assets/img/logo.png"
import styles from "./nav-bar.module.css"

interface NavLink {
    id:number;
    option:string;
    href:string;
}



const  accountLinks: NavLink[] = [
    {
        id: 0, 
        option: "Login",
        href: "login"
    },
    {
        id: 1, 
        option: "Signup",
        href: "signup"
    }
]

const navLinks: NavLink[] = [
    {
        id: 0, 
        option: "Workspace/Dashboard",
        href: "link_to_Workspace/Dashboard"
    },
    {  
        id: 1, 
        option: "Projects",
        href: "link_to_Projects"
    },
    {
        id: 2, 
        option: "Boards",
        href: "link_to_Boards"
    },
    {
        id: 3, 
        option: "Teams",
        href: "link_to_Teams"
    },
    {  
        id: 4, 
        option: "My Tasks",
        href: "link_to_My Tasks"
    },
    {
        id: 5, 
        option: "Notifications",
        href: "link_to_Notifications"
    }
]

export function NavBar () {    
    const isLoggedIn = false;
    return (
        <div className="container">
            <nav>
                <div className={styles.logo}>
                    <img src={logo} alt="Logo" />
                </div>
                <div className={styles.nav_menu}>
                    {isLoggedIn ? (
                        <ul>
                        {navLinks.map((link) => {
                            return (
                                <li key={link.id}><a  href={link.href}>{link.option}</a></li>
                            );
                        })}                
                    </ul>
                    ) : (
                        <div className={styles.prompt_msg}>
                            <h3 className={styles.neon_text}>Please <a href="/login">Login</a> to access your workspace</h3>
                        </div>
                    )}
                    
                </div>
                <div className={styles.account}>
                    <a className={styles.account_link} href="#">
                        Account
                    </a>

                    <ul className={styles.submenu_login}>
                        {accountLinks.map((link) => {
                            return (
                                <li key={link.id}><a href={link.href}>{link.option}</a> </li>
                            ); 
                        })}
                    </ul>
                </div>
            </nav>
        </div>
    )
};
