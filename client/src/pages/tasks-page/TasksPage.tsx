import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import { AuthContext } from '../../api/authContext'
import styles from './TasksPage.module.css'

const api = getApi(`${import.meta.env.VITE_API_URL}/tasks/api/v1`)
const employeesApi = getApi(`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_APP_EMPLOYEE}`)

interface Task {
    id: number
    title: string
    description: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    created_at: string
    updated_at: string
    author: string
    assigned_to: number | null
    assigned_to_name: string | null
}

interface Employee {
    id: number
    first_name: string
    last_name: string
    email: string
}

interface EditForm {
    title: string
    description: string
    status: Task['status']
    priority: Task['priority']
    due_date: string
    assigned_to: number | ''
}

const STATUS_OPTIONS: { value: Task['status']; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
]

const PRIORITY_LABELS: Record<Task['priority'], string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
}

const TASK_CREATOR_DEPARTMENTS = ['QA', 'Development', 'DevOps', 'Cybersecurity', 'Design', 'Management', 'Business & Analysis']

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function TasksPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)!
    const canCreateTask = user?.is_seo_user || TASK_CREATOR_DEPARTMENTS.includes(user?.department_name ?? '')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [editForm, setEditForm] = useState<EditForm | null>(null)
    const [saving, setSaving] = useState(false)

    const { data: tasks, isLoading, isError } = useQuery<Task[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get('/')
            return res.data
        },
    })

    const { data: employees } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: () => employeesApi.get('/my_employeers/').then(r => r.data),
    })

    function openTask(task: Task) {
        setSelectedTask(task)
        setEditForm({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            due_date: task.due_date ?? '',
            assigned_to: task.assigned_to ?? '',
        })
    }

    function closeTask() {
        setSelectedTask(null)
        setEditForm(null)
    }

    function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setEditForm(prev => prev ? { ...prev, [e.target.name]: e.target.value } : prev)
    }

    function handleStatusClick(newStatus: Task['status']) {
        setEditForm(prev => prev ? { ...prev, status: newStatus } : prev)
    }

    async function handleSave() {
        if (!selectedTask || !editForm || saving) return
        if (!editForm.title.trim()) return
        setSaving(true)
        try {
            const payload: Record<string, unknown> = {
                title: editForm.title.trim(),
                description: editForm.description,
                status: editForm.status,
                priority: editForm.priority,
                due_date: editForm.due_date || null,
                assigned_to: editForm.assigned_to !== '' ? Number(editForm.assigned_to) : null,
            }
            const res = await api.patch(`/${selectedTask.id}/`, payload)
            const updated: Task = { ...selectedTask, ...res.data }
            queryClient.setQueryData<Task[]>(['tasks'], (old) =>
                old?.map((t) => (t.id === selectedTask.id ? updated : t))
            )
            closeTask()
        } catch {
            alert('Failed to save changes.')
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) return <div className={styles.state}>Loading tasks...</div>
    if (isError) return <div className={styles.state}>Failed to load tasks.</div>

    return (
        <div className={styles.page}>
            <div className={styles.page_header}>
                <h1 className={styles.title}>My Tasks</h1>
                {canCreateTask && (
                    <button className={styles.create_btn} onClick={() => navigate('/tasks/create')}>
                        + Create Task
                    </button>
                )}
            </div>

            {tasks && tasks.length === 0 && (
                <p className={styles.empty}>No tasks assigned to you.</p>
            )}

            <ul className={styles.list}>
                {tasks?.map((task) => (
                    <li
                        key={task.id}
                        className={styles.item}
                        onClick={() => openTask(task)}
                    >
                        <div className={styles.item_header}>
                            <div className={styles.item_title_row}>
                                <span className={styles.item_id}>#{task.id}</span>
                                <span className={styles.item_title}>{task.title}</span>
                            </div>
                            <span className={`${styles.priority} ${styles[`priority_${task.priority}`]}`}>
                                {PRIORITY_LABELS[task.priority]}
                            </span>
                        </div>
                        <div className={styles.item_footer}>
                            <span className={`${styles.status} ${styles[`status_${task.status}`]}`}>
                                {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                            </span>
                            {task.due_date && (
                                <span className={styles.due_date}>Due: {task.due_date}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {selectedTask && editForm && (
                <div className={styles.overlay} onClick={closeTask}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.close} onClick={closeTask}>✕</button>

                        <input
                            className={styles.modal_title_input}
                            name="title"
                            value={editForm.title}
                            onChange={handleFormChange}
                        />

                        <div className={styles.modal_row}>
                            <div className={styles.modal_field_edit}>
                                <span className={styles.field_label}>Priority</span>
                                <select
                                    className={styles.modal_select}
                                    name="priority"
                                    value={editForm.priority}
                                    onChange={handleFormChange}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className={styles.modal_field_edit}>
                                <span className={styles.field_label}>Due date</span>
                                <input
                                    className={styles.modal_input}
                                    type="date"
                                    name="due_date"
                                    value={editForm.due_date}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <div className={styles.modal_field_edit}>
                            <span className={styles.field_label}>Assigned to</span>
                            <select
                                className={styles.modal_select}
                                name="assigned_to"
                                value={editForm.assigned_to}
                                onChange={handleFormChange}
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

                        <div className={styles.status_row}>
                            <span className={styles.status_label}>Status:</span>
                            <div className={styles.status_buttons}>
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`${styles.status_btn} ${styles[`status_${opt.value}`]} ${editForm.status === opt.value ? styles.status_btn_active : ''}`}
                                        onClick={() => handleStatusClick(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modal_fields}>
                            <div className={styles.modal_field}>
                                <span className={styles.field_label}>Author</span>
                                <span className={styles.field_value}>{selectedTask.author}</span>
                            </div>
                            <div className={styles.modal_field}>
                                <span className={styles.field_label}>Created</span>
                                <span className={styles.field_value}>{formatDate(selectedTask.created_at)}</span>
                            </div>
                            <div className={styles.modal_field}>
                                <span className={styles.field_label}>Updated</span>
                                <span className={styles.field_value}>{formatDate(selectedTask.updated_at)}</span>
                            </div>
                        </div>

                        <div className={styles.modal_description_label}>Description</div>
                        <textarea
                            className={styles.modal_textarea}
                            name="description"
                            value={editForm.description}
                            onChange={handleFormChange}
                            rows={4}
                        />

                        <div className={styles.modal_footer}>
                            <button
                                className={styles.modal_save}
                                onClick={handleSave}
                                disabled={saving || !editForm.title.trim()}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
