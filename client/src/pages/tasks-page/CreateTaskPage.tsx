import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import { AuthContext } from '../../api/authContext'
import styles from './CreateTaskPage.module.css'

const tasksApi = getApi(`${import.meta.env.VITE_API_URL}/tasks/api/v1`)
const employeesApi = getApi(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}`)

const TASK_CREATOR_DEPARTMENTS = ['QA', 'Development', 'DevOps', 'Cybersecurity', 'Design', 'Management', 'Business & Analysis']

interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
}

interface TaskFormData {
    title: string
    description: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    due_date: string
    assigned_to: number | ''
}

export function CreateTaskPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useContext(AuthContext)!
    const canCreate = user?.is_seo_user || TASK_CREATOR_DEPARTMENTS.includes(user?.department_name ?? '')

    useEffect(() => {
        if (user !== null && !canCreate) navigate('/tasks')
    }, [user, canCreate, navigate])

    const [form, setForm] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
    })
    const [error, setError] = useState<string | null>(null)

    const { data: employees } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: () => employeesApi.get('/my_employeers/').then(r => r.data),
    })

    const mutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => tasksApi.post('/', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
            navigate('/tasks')
        },
        onError: () => setError('Failed to create task. Please check the fields and try again.'),
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setError(null)
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.title.trim()) {
            setError('Title is required.')
            return
        }
        const payload: Record<string, unknown> = {
            title: form.title.trim(),
            description: form.description,
            status: form.status,
            priority: form.priority,
        }
        if (form.due_date) payload.due_date = form.due_date
        if (form.assigned_to !== '') payload.assigned_to = Number(form.assigned_to)
        mutation.mutate(payload)
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Create Task</h1>
                <button className={styles.cancel} type="button" onClick={() => navigate('/tasks')}>
                    Cancel
                </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.field}>
                    <label className={styles.label}>Title *</label>
                    <input
                        className={styles.input}
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Task title"
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
                        rows={4}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>Priority</label>
                        <select className={styles.select} name="priority" value={form.priority} onChange={handleChange}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Status</label>
                        <select className={styles.select} name="status" value={form.status} onChange={handleChange}>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>Due date</label>
                        <input
                            className={styles.input}
                            type="date"
                            name="due_date"
                            value={form.due_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Assign to</label>
                        <select
                            className={styles.select}
                            name="assigned_to"
                            value={form.assigned_to}
                            onChange={handleChange}
                        >
                            <option value="">— Unassigned —</option>
                            {employees?.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name && emp.last_name
                                        ? `${emp.first_name} ${emp.last_name}`
                                        : emp.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className={styles.submit} type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
            </form>
        </div>
    )
}