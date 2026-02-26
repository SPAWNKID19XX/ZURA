import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import styles from './TasksPage.module.css'

const api = getApi(`${import.meta.env.VITE_API_URL}/tasks/api/v1`)

interface Task {
    id: number
    title: string
    description: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    created_at: string
    author: string
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

export function TasksPage() {
    const queryClient = useQueryClient()
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [saving, setSaving] = useState(false)

    const { data: tasks, isLoading, isError } = useQuery<Task[]>({
        queryKey: ['myTasks'],
        queryFn: async () => {
            const res = await api.get('/?mine=true')
            return res.data
        },
    })

    async function handleStatusChange(newStatus: Task['status']) {
        if (!selectedTask || saving) return
        setSaving(true)
        try {
            await api.patch(`/${selectedTask.id}/`, { status: newStatus })
            const updated = { ...selectedTask, status: newStatus }
            setSelectedTask(updated)
            queryClient.setQueryData<Task[]>(['myTasks'], (old) =>
                old?.map((t) => (t.id === selectedTask.id ? updated : t))
            )
        } catch {
            alert('Failed to update status.')
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) return <div className={styles.state}>Loading tasks...</div>
    if (isError) return <div className={styles.state}>Failed to load tasks.</div>

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>My Tasks</h1>

            {tasks && tasks.length === 0 && (
                <p className={styles.empty}>No tasks assigned to you.</p>
            )}

            <ul className={styles.list}>
                {tasks?.map((task) => (
                    <li
                        key={task.id}
                        className={styles.item}
                        onClick={() => setSelectedTask(task)}
                    >
                        <div className={styles.item_header}>
                            <span className={styles.item_title}>{task.title}</span>
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

            {selectedTask && (
                <div className={styles.overlay} onClick={() => setSelectedTask(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.close} onClick={() => setSelectedTask(null)}>✕</button>
                        <h2 className={styles.modal_title}>{selectedTask.title}</h2>

                        <div className={styles.modal_meta}>
                            <span className={`${styles.priority} ${styles[`priority_${selectedTask.priority}`]}`}>
                                {PRIORITY_LABELS[selectedTask.priority]}
                            </span>
                            {selectedTask.due_date && (
                                <span className={styles.due_date}>Due: {selectedTask.due_date}</span>
                            )}
                        </div>

                        <div className={styles.status_row}>
                            <span className={styles.status_label}>Status:</span>
                            <div className={styles.status_buttons}>
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        disabled={saving}
                                        className={`${styles.status_btn} ${styles[`status_${opt.value}`]} ${selectedTask.status === opt.value ? styles.status_btn_active : ''}`}
                                        onClick={() => handleStatusChange(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className={styles.modal_author}>Author: {selectedTask.author}</p>
                        <div className={styles.modal_description}>
                            {selectedTask.description || <em>No description provided.</em>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
