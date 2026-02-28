import logo from "../../assets/img/logo.png"
import styles from "./nav-bar.module.css"
import { useContext } from "react";
import { AuthContext } from "../../api/authContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "../../api/api";


interface NavLink {
    id:number;
    option:string;
    href:string;
}



const  accountLinks: NavLink[] = [
    {
        id: 0, 
        option: "Login",
        href: "/login"
    },
    {
        id: 1, 
        option: "Signup",
        href: "/signup"
    }
]

const navLinks: NavLink[] = [
    {
        id: 0,
        option: "My Tasks",
        href: "/tasks"
    },
    {
        id: 1,
        option: "Projects",
        href: "/projects"
    },
    {
        id: 2,
        option: "Boards",
        href: "/boards"
    },
    {
        id: 4,
        option: "Employees",
        href: "/employees"
    },
    {
        id: 5,
        option: "Notifications",
        href: "/notifications"
    }
]

const notificationsApi = getApi(`${import.meta.env.VITE_API_URL}/notifications/api/v1`);

export function NavBar () {
    const { user } = useContext(AuthContext)!;
    const  { logout } = useContext(AuthContext)!;
    const isLoggedIn = !!user;

    const { data: unreadData } = useQuery<{ count: number }>({
        queryKey: ["unreadCount"],
        queryFn: () => notificationsApi.get("/unread_count/").then((r) => r.data),
        refetchInterval: 30000,
        enabled: isLoggedIn,
    });
    const unreadCount = unreadData?.count ?? 0;

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
                                const isNotifications = link.href === "/notifications";
                                return (
                                    <li key={link.id} className={isNotifications ? styles.nav_link_wrapper : undefined}>
                                        <Link to={link.href}>{link.option}</Link>
                                        {isNotifications && unreadCount > 0 && (
                                            <span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        ) : (
                            <div className={styles.prompt_msg}>
                                <h3 className={styles.neon_text}>Please <a href="/login">Login</a> to access your workspace</h3>
                            </div>
                        )
                    }
                    
                </div>
                <div className={styles.account}>
                    {!isLoggedIn ? (
                        <>
                            <a className={styles.account_link} href="#">
                                Account
                            </a>
                            <ul className={styles.submenu_login}>
                                {accountLinks.map((link) => {
                                    return (
                                        <li key={link.id}><Link to={link.href}>{link.option}</Link></li>
                                    ); 
                                })}
                            </ul>
                        </>
                        ) : (
                        <>
                            <Link 
                                className={styles.account_link} 
                                to="/my_account"
                            >
                                {user.email}
                            </Link>            
                            <Link 
                                className={styles.account_link} 
                                to="/login"
                                onClick={() => {
                                    logout();
                                }}
                            >
                                Logout
                            </Link>                       
                        </>
                        )
                    }
                </div>
            </nav>
        </div>
    )
};
