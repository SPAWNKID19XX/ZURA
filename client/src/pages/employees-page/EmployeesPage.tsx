import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import { AuthContext } from '../../api/authContext'
import styles from './EmployeesPage.module.css'

const api = getApi(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}`)

interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
    is_seo_user: boolean
    company: number | null
    company_name: string | null
    department: number | null
    department_name: string | null
    role: number | null
    role_name: string | null
}

interface Department {
    id: number
    name: string
}

interface Role {
    id: number
    name: string
    department: number
}

interface HireForm {
    email: string
    first_name: string
    last_name: string
    phone: string
    department: number | ''
    role: number | ''
}

const EMPTY_FORM: HireForm = {
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    role: '',
}

function displayName(emp: Employee): string {
    const full = [emp.first_name, emp.last_name].filter(Boolean).join(' ')
    return full || emp.email
}

export function EmployeesPage() {
    const queryClient = useQueryClient()
    const { user } = useContext(AuthContext)!

    const [selected, setSelected] = useState<Employee | null>(null)
    const [confirmFire, setConfirmFire] = useState(false)
    const [showHireForm, setShowHireForm] = useState(false)
    const [hireForm, setHireForm] = useState<HireForm>(EMPTY_FORM)
    const [hireError, setHireError] = useState<string | null>(null)

    const { data: employees, isLoading, isError } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: () => api.get('/my_employeers/').then(r => r.data),
    })

    const { data: departments } = useQuery<Department[]>({
        queryKey: ['departments'],
        queryFn: () => api.get('/departments/').then(r => r.data),
        enabled: showHireForm,
    })

    const { data: roles } = useQuery<Role[]>({
        queryKey: ['roles'],
        queryFn: () => api.get('/roles/').then(r => r.data),
        enabled: showHireForm,
    })

    const filteredRoles = roles?.filter(r => r.department === Number(hireForm.department)) ?? []

    const fireMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/my_employeers/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            setSelected(null)
            setConfirmFire(false)
        },
    })

    const hireMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => api.post('/my_employeers/', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            setShowHireForm(false)
            setHireForm(EMPTY_FORM)
            setHireError(null)
        },
        onError: (err: any) => {
            const data = err.response?.data
            const msg = data?.email?.[0] ?? data?.detail ?? 'Failed to hire employee. Check the fields.'
            setHireError(msg)
        },
    })

    function handleHireChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setHireError(null)
        if (name === 'department') {
            setHireForm(prev => ({ ...prev, department: value === '' ? '' : Number(value), role: '' }))
        } else {
            setHireForm(prev => ({ ...prev, [name]: name === 'role' ? (value === '' ? '' : Number(value)) : value }))
        }
    }

    function handleHireSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!hireForm.email.trim()) { setHireError('Email is required.'); return }
        if (!hireForm.department) { setHireError('Department is required.'); return }
        if (!hireForm.role) { setHireError('Role is required.'); return }
        const payload: Record<string, unknown> = {
            email: hireForm.email.trim(),
            department: hireForm.department,
            role: hireForm.role,
        }
        if (hireForm.first_name.trim()) payload.first_name = hireForm.first_name.trim()
        if (hireForm.last_name.trim()) payload.last_name = hireForm.last_name.trim()
        if (hireForm.phone.trim()) payload.phone = hireForm.phone.trim()
        hireMutation.mutate(payload)
    }

    function closeHireForm() {
        setShowHireForm(false)
        setHireForm(EMPTY_FORM)
        setHireError(null)
    }

    if (isLoading) return <div className={styles.state}>Loading employees...</div>
    if (isError) return <div className={styles.state}>Failed to load employees.</div>

    return (
        <div className={styles.page}>
            <div className={styles.page_header}>
                <h1 className={styles.title}>Employees</h1>
                {user?.is_seo_user && (
                    <button className={styles.hire_btn} onClick={() => setShowHireForm(true)}>
                        + Hire Employee
                    </button>
                )}
            </div>

            {employees && employees.length === 0 && (
                <p className={styles.empty}>No employees in your company yet.</p>
            )}

            {employees && employees.length > 0 && (
                <div className={styles.table_wrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Email</th>
                                <th className={styles.th}>Department</th>
                                <th className={styles.th}>Role</th>
                                <th className={styles.th}>Company</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} className={styles.row} onClick={() => setSelected(emp)}>
                                    <td className={styles.td}>
                                        <span className={styles.name}>{displayName(emp)}</span>
                                    </td>
                                    <td className={styles.td}>{emp.email}</td>
                                    <td className={styles.td}>
                                        {emp.department_name
                                            ? <span className={styles.badge}>{emp.department_name}</span>
                                            : <span className={styles.empty_cell}>—</span>}
                                    </td>
                                    <td className={styles.td}>
                                        {emp.role_name ?? <span className={styles.empty_cell}>—</span>}
                                    </td>
                                    <td className={styles.td}>
                                        {emp.company_name ?? <span className={styles.empty_cell}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Employee detail modal */}
            {selected && !confirmFire && (
                <div className={styles.overlay} onClick={() => setSelected(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.close} onClick={() => setSelected(null)}>✕</button>
                        <div className={styles.avatar}>
                            {(selected.first_name?.[0] ?? selected.email[0]).toUpperCase()}
                        </div>
                        <h2 className={styles.modal_name}>{displayName(selected)}</h2>
                        {selected.is_seo_user && <span className={styles.owner_badge}>Owner</span>}
                        <dl className={styles.details}>
                            <div className={styles.detail_row}>
                                <dt>Email</dt><dd>{selected.email}</dd>
                            </div>
                            <div className={styles.detail_row}>
                                <dt>Phone</dt><dd>{selected.phone || '—'}</dd>
                            </div>
                            <div className={styles.detail_row}>
                                <dt>Department</dt><dd>{selected.department_name || '—'}</dd>
                            </div>
                            <div className={styles.detail_row}>
                                <dt>Role</dt><dd>{selected.role_name || '—'}</dd>
                            </div>
                            <div className={styles.detail_row}>
                                <dt>Company</dt><dd>{selected.company_name || '—'}</dd>
                            </div>
                        </dl>
                        {user?.is_seo_user && !selected.is_seo_user && (
                            <button className={styles.fire_btn} onClick={() => setConfirmFire(true)}>
                                Fire employee
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Fire confirmation */}
            {confirmFire && selected && (
                <div className={styles.overlay} onClick={() => setConfirmFire(false)}>
                    <div className={styles.confirm} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.confirm_title}>Fire {displayName(selected)}?</h3>
                        <p className={styles.confirm_text}>
                            This will permanently remove the employee from your company. This action cannot be undone.
                        </p>
                        <div className={styles.confirm_actions}>
                            <button className={styles.confirm_cancel} onClick={() => setConfirmFire(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirm_fire}
                                disabled={fireMutation.isPending}
                                onClick={() => selected && fireMutation.mutate(selected.id)}
                            >
                                {fireMutation.isPending ? 'Firing...' : 'Yes, fire'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hire employee form modal */}
            {showHireForm && (
                <div className={styles.overlay} onClick={closeHireForm}>
                    <div className={styles.hire_modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.close} onClick={closeHireForm}>✕</button>
                        <h2 className={styles.hire_title}>Hire Employee</h2>
                        <p className={styles.hire_subtitle}>
                            A default password <code>admin12345</code> will be set. The employee should change it on first login.
                        </p>

                        <form className={styles.hire_form} onSubmit={handleHireSubmit}>
                            {hireError && <p className={styles.error}>{hireError}</p>}

                            <div className={styles.hire_row}>
                                <div className={styles.field}>
                                    <label className={styles.label}>First name</label>
                                    <input
                                        className={styles.input}
                                        name="first_name"
                                        value={hireForm.first_name}
                                        onChange={handleHireChange}
                                        placeholder="John"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Last name</label>
                                    <input
                                        className={styles.input}
                                        name="last_name"
                                        value={hireForm.last_name}
                                        onChange={handleHireChange}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Email *</label>
                                <input
                                    className={styles.input}
                                    name="email"
                                    type="email"
                                    value={hireForm.email}
                                    onChange={handleHireChange}
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Phone</label>
                                <input
                                    className={styles.input}
                                    name="phone"
                                    value={hireForm.phone}
                                    onChange={handleHireChange}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className={styles.hire_row}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Department *</label>
                                    <select
                                        className={styles.select}
                                        name="department"
                                        value={hireForm.department}
                                        onChange={handleHireChange}
                                    >
                                        <option value="">— Select —</option>
                                        {departments?.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Role *</label>
                                    <select
                                        className={styles.select}
                                        name="role"
                                        value={hireForm.role}
                                        onChange={handleHireChange}
                                        disabled={!hireForm.department}
                                    >
                                        <option value="">— Select —</option>
                                        {filteredRoles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.hire_actions}>
                                <button type="button" className={styles.confirm_cancel} onClick={closeHireForm}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submit_btn} disabled={hireMutation.isPending}>
                                    {hireMutation.isPending ? 'Hiring...' : 'Hire'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}