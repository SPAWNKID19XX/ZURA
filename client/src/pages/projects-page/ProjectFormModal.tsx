import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import styles from './ProjectFormModal.module.css'

const projectsApi = getApi(`${import.meta.env.VITE_API_URL}/projects/api/v1`)
const employeesApi = getApi(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}`)

export type ProjectStatus = 'new' | 'active' | 'completed' | 'archived'

export interface ProjectMember {
    id: number
    full_name: string
    role_name: string | null
}

export interface Project {
    id: number
    title: string
    description: string
    status: ProjectStatus
    created_by: number
    created_by_name: string
    lead: number | null
    lead_name: string | null
    members: number[]
    members_detail: ProjectMember[]
    start_date: string | null
    end_date: string | null
    created_at: string
    updated_at: string
}

interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
    role_name: string | null
}

interface FormData {
    title: string
    description: string
    status: ProjectStatus
    lead: number | ''
    members: number[]
    start_date: string
    end_date: string
}

interface Props {
    project?: Project | null
    onClose: () => void
    onSuccess: () => void
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
]

function getEmployeeName(emp: Employee): string {
    const name = `${emp.first_name} ${emp.last_name}`.trim()
    return name || emp.email
}

export function ProjectFormModal({ project, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient()
    const isEdit = !!project

    const [form, setForm] = useState<FormData>({
        title: project?.title ?? '',
        description: project?.description ?? '',
        status: project?.status ?? 'new',
        lead: project?.lead ?? '',
        members: project?.members ?? [],
        start_date: project?.start_date ?? '',
        end_date: project?.end_date ?? '',
    })
    const [error, setError] = useState<string | null>(null)

    const { data: employees } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: () => employeesApi.get('/my_employeers/').then(r => r.data),
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setError(null)
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function toggleMember(id: number) {
        setForm(prev => ({
            ...prev,
            members: prev.members.includes(id)
                ? prev.members.filter(m => m !== id)
                : [...prev.members, id],
        }))
    }

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            isEdit
                ? projectsApi.patch(`/${project!.id}/`, payload)
                : projectsApi.post('/', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            if (isEdit) queryClient.invalidateQueries({ queryKey: ['project', project!.id] })
            onSuccess()
        },
        onError: () => setError('Something went wrong. Please try again.'),
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.title.trim()) {
            setError('Title is required.')
            return
        }
        mutation.mutate({
            title: form.title.trim(),
            description: form.description,
            status: form.status,
            lead: form.lead !== '' ? Number(form.lead) : null,
            members: form.members,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
        })
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.close} onClick={onClose}>✕</button>
                <h2 className={styles.modal_title}>{isEdit ? 'Edit Project' : 'New Project'}</h2>

                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.field}>
                        <label className={styles.label}>Title *</label>
                        <input
                            className={styles.input}
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Project title"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Optional description"
                            rows={3}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Status</label>
                            <select className={styles.select} name="status" value={form.status} onChange={handleChange}>
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Lead</label>
                            <select className={styles.select} name="lead" value={form.lead} onChange={handleChange}>
                                <option value="">— No lead —</option>
                                {employees?.map(emp => (
                                    <option key={emp.id} value={emp.id}>{getEmployeeName(emp)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Start date</label>
                            <input
                                className={styles.input}
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>End date</label>
                            <input
                                className={styles.input}
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Team members</label>
                        <div className={styles.members_list}>
                            {employees?.length === 0 && (
                                <p className={styles.no_employees}>No employees in company yet.</p>
                            )}
                            {employees?.map(emp => (
                                <label key={emp.id} className={styles.member_option}>
                                    <input
                                        type="checkbox"
                                        checked={form.members.includes(emp.id)}
                                        onChange={() => toggleMember(emp.id)}
                                    />
                                    <span className={styles.member_name}>{getEmployeeName(emp)}</span>
                                    {emp.role_name && (
                                        <span className={styles.member_role}>{emp.role_name}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancel_btn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submit_btn} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}