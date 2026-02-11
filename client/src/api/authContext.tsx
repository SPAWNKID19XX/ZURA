import { createContext } from 'react';

export interface Employeer {
    email:string,
    first_name?: string,
    last_name?: string,
    is_employeer?: boolean,
    is_seo_user?: boolean
}

interface AuthContextType {
    user: Employeer | null,
    loading: boolean,
    loginSuccess: (userData:Employeer) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
