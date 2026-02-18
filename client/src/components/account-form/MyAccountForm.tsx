import {styles} from "./MyAccountForm.module.css"

interface MyData {
    email: string,
    first_name: string,
    last_name: string,
    is_superuser: boolean,
    is_staff: boolean,
    is_employee: boolean,
    

}

export function MyAccountForm() {
    return (
    <>
        <form>
            <h3>Users_email account</h3>

            <button>Edit Data</button>
        </form>
    </>
    );
}