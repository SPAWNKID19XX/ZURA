import { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import { AuthContext } from '../../api/authContext'
import { ProjectFormModal } from './ProjectFormModal'
import type { Project, ProjectStatus } from './ProjectFormModal'
import styles from './ProjectDetailPage.module.css'

const projectsApi = getApi(`${import.meta.env.VITE_API_URL}/projects/api/v1`)
const tasksApi = getApi(`${import.meta.env.VITE_API_URL}/tasks/api/v1`)

interface Task {
    id: number
    title: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    assigned_to_name: string | null
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
    new: 'New',
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
}

const TASK_STATUS_LABELS: Record<Task['status'], string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
}

function formatDate(date: string | null): string {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)!
    const [showEdit, setShowEdit] = useState(false)

    const { data: project, isLoading, isError } = useQuery<Project>({
        queryKey: ['project', Number(id)],
        queryFn: () => projectsApi.get(`/${id}/`).then(r => r.data),
        enabled: !!id,
    })

    const { data: tasks } = useQuery<Task[]>({
        queryKey: ['tasks', { project: id }],
        queryFn: () => tasksApi.get(`/?project=${id}`).then(r => r.data),
        enabled: !!id,
    })

    if (isLoading) return <div className={styles.state}>Loading project...</div>
    if (isError || !project) return <div className={styles.state}>Project not found.</div>

    const canEdit = user?.is_seo_user || project.lead === user?.id

    return (
        <div className={styles.page}>
            <button className={styles.back_btn} onClick={() => navigate('/projects')}>
                ← Back to Projects
            </button>

            <div className={styles.header}>
                <div className={styles.header_left}>
                    <span className={`${styles.status} ${styles[`status_${project.status}`]}`}>
                        {STATUS_LABELS[project.status]}
                    </span>
                    <h1 className={styles.title}>{project.title}</h1>
                </div>
                {canEdit && (
                    <button className={styles.edit_btn} onClick={() => setShowEdit(true)}>
                        Edit
                    </button>
                )}
            </div>

            {project.description && (
                <p className={styles.description}>{project.description}</p>
            )}

            {/* Info grid */}
            <div className={styles.info_grid}>
                <div className={styles.info_item}>
                    <span className={styles.info_label}>Created by</span>
                    <span className={styles.info_value}>{project.created_by_name}</span>
                </div>
                <div className={styles.info_item}>
                    <span className={styles.info_label}>Lead</span>
                    <span className={styles.info_value}>{project.lead_name ?? '—'}</span>
                </div>
                <div className={styles.info_item}>
                    <span className={styles.info_label}>Start date</span>
                    <span className={styles.info_value}>{formatDate(project.start_date)}</span>
                </div>
                <div className={styles.info_item}>
                    <span className={styles.info_label}>End date</span>
                    <span className={styles.info_value}>{formatDate(project.end_date)}</span>
                </div>
            </div>

            {/* Members */}
            <section className={styles.section}>
                <h2 className={styles.section_title}>
                    Team members
                    <span className={styles.section_count}>{project.members_detail.length}</span>
                </h2>
                {project.members_detail.length === 0 ? (
                    <p className={styles.section_empty}>No members assigned.</p>
                ) : (
                    <div className={styles.members_list}>
                        {project.members_detail.map(member => (
                            <div key={member.id} className={styles.member}>
                                <div className={styles.member_avatar}>
                                    {getInitials(member.full_name)}
                                </div>
                                <div className={styles.member_info}>
                                    <span className={styles.member_name}>{member.full_name}</span>
                                    {member.role_name && (
                                        <span className={styles.member_role}>{member.role_name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Tasks */}
            <section className={styles.section}>
                <h2 className={styles.section_title}>
                    Tasks
                    <span className={styles.section_count}>{tasks?.length ?? 0}</span>
                </h2>
                {!tasks || tasks.length === 0 ? (
                    <p className={styles.section_empty}>No tasks linked to this project.</p>
                ) : (
                    <ul className={styles.tasks_list}>
                        {tasks.map(task => (
                            <li key={task.id} className={styles.task_item}>
                                <div className={styles.task_left}>
                                    <span className={styles.task_id}>#{task.id}</span>
                                    <span className={styles.task_title}>{task.title}</span>
                                </div>
                                <div className={styles.task_right}>
                                    {task.assigned_to_name && (
                                        <span className={styles.task_assignee}>{task.assigned_to_name}</span>
                                    )}
                                    <span className={`${styles.task_status} ${styles[`task_status_${task.status}`]}`}>
                                        {TASK_STATUS_LABELS[task.status]}
                                    </span>
                                    <span className={`${styles.task_priority} ${styles[`task_priority_${task.priority}`]}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {showEdit && (
                <ProjectFormModal
                    project={project}
                    onClose={() => setShowEdit(false)}
                    onSuccess={() => setShowEdit(false)}
                />
            )}
        </div>
    )
}