import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApi } from '../../api/api'
import { AuthContext } from '../../api/authContext'
import { ProjectFormModal } from './ProjectFormModal'
import type { Project, ProjectStatus } from './ProjectFormModal'
import styles from './ProjectsPage.module.css'

const projectsApi = getApi(`${import.meta.env.VITE_API_URL}/projects/api/v1`)

const STATUS_LABELS: Record<ProjectStatus, string> = {
    new: 'New',
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
}

function formatDate(date: string | null): string {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ProjectsPage() {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)!
    const [showModal, setShowModal] = useState(false)

    const { data: projects, isLoading, isError } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: () => projectsApi.get('/').then(r => r.data),
    })

    if (isLoading) return <div className={styles.state}>Loading projects...</div>
    if (isError) return <div className={styles.state}>Failed to load projects.</div>

    return (
        <div className={styles.page}>
            <div className={styles.page_header}>
                <h1 className={styles.title}>Projects</h1>
                {user?.is_seo_user && (
                    <button className={styles.create_btn} onClick={() => setShowModal(true)}>
                        + New Project
                    </button>
                )}
            </div>

            {projects?.length === 0 && (
                <p className={styles.empty}>No projects yet.</p>
            )}

            <div className={styles.grid}>
                {projects?.map(project => (
                    <div
                        key={project.id}
                        className={styles.card}
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <div className={styles.card_header}>
                            <span className={`${styles.status} ${styles[`status_${project.status}`]}`}>
                                {STATUS_LABELS[project.status]}
                            </span>
                            <span className={styles.members_count}>
                                {project.members_detail.length} member{project.members_detail.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <h2 className={styles.card_title}>{project.title}</h2>

                        {project.description && (
                            <p className={styles.card_desc}>{project.description}</p>
                        )}

                        <div className={styles.card_footer}>
                            {project.lead_name && (
                                <span className={styles.lead}>Lead: {project.lead_name}</span>
                            )}
                            <div className={styles.dates}>
                                {project.start_date && <span>{formatDate(project.start_date)}</span>}
                                {project.start_date && project.end_date && <span>→</span>}
                                {project.end_date && <span>{formatDate(project.end_date)}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <ProjectFormModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setShowModal(false)}
                />
            )}
        </div>
    )
}