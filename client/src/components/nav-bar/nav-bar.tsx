import logo from "../../assets/img/logo.png"
import styles from "./nav-bar.module.css"

interface navLink {
    id:number;
    option:string;
    href:string;
}

interface accountLink {
    id:number;
    option:string;
    href:string;
}

const  accountLinks: accountLink[] = [
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

const navLinks: navLink[] = [
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
    return (
        <>
            
            <div className="conteiner">
                <nav>
                    <div className={styles.logo}>
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className={styles.nav_menu}>
                        <ul>
                            {navLinks.map((link) => {
                                return (
                                    <li key={link.id}><a  href={link.href}>{link.option}</a></li>
                                );
                            })}                
                        </ul>
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
        </>
    )
};
