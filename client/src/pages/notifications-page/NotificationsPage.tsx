import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApi } from "../../api/api";
import styles from "./NotificationsPage.module.css";

const api = getApi(`${import.meta.env.VITE_API_URL}/notifications/api/v1`);

interface TaskBrief {
    id: number;
    title: string;
}

interface ProjectBrief {
    id: number;
    title: string;
}

interface Notification {
    id: number;
    type: "task_assigned" | "project_added";
    message: string;
    is_read: boolean;
    created_at: string;
    task: TaskBrief | null;
    project: ProjectBrief | null;
}

function formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const typeIcon: Record<Notification["type"], string> = {
    task_assigned: "📋",
    project_added: "🗂",
};

export function NotificationsPage() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: () => api.get("/").then((r) => r.data),
    });

    const markRead = useMutation({
        mutationFn: (id: number) => api.patch(`/${id}/`, { is_read: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        },
    });

    const markAllRead = useMutation({
        mutationFn: () => api.post("/mark_all_read/"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        },
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h1>Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        className={styles.markAllBtn}
                        onClick={() => markAllRead.mutate()}
                        disabled={markAllRead.isPending}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {isLoading && <p>Loading…</p>}

            {!isLoading && notifications.length === 0 && (
                <p className={styles.empty}>No notifications yet.</p>
            )}

            <ul className={styles.list}>
                {notifications.map((n) => (
                    <li
                        key={n.id}
                        className={`${styles.item} ${!n.is_read ? styles.item_unread : ""}`}
                        onClick={() => {
                            if (!n.is_read) markRead.mutate(n.id);
                        }}
                    >
                        <span className={styles.item_icon}>{typeIcon[n.type]}</span>
                        <span className={styles.item_message}>{n.message}</span>
                        <span className={styles.item_time}>{formatDate(n.created_at)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
