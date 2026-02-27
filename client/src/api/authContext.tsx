import { createContext } from 'react';

export interface Employeer {
    id?: number,
    email: string,
    first_name?: string,
    last_name?: string,
    is_employeer?: boolean,
    is_seo_user?: boolean,
    department_name?: string | null,
}

interface AuthContextType {
    user: Employeer | null,
    loading: boolean,
    loginSuccess: (userData:Employeer) => void;
    logout: () => void; 
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);
