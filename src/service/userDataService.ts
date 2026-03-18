import { ProfileResponse, ProjectsResponse, AssignedTasksResponse, ProjectTasksResponse, Task } from "@/types"
import { fetchWithAuth } from "@/service/fetchWithAuth"

/** Récupère le profil de l'utilisateur connecté */
export async function getProfile(): Promise<ProfileResponse> {
    const response = await fetchWithAuth<ProfileResponse>("/auth/profile", "GET")
    if (!response) throw new Error("Erreur lors de la récupération du profil")
    return response
}

/** Met à jour les informations du profil (nom, email) */
export async function updateProfile(body: object): Promise<ProfileResponse> {
    const response = await fetchWithAuth<ProfileResponse>("/auth/profile", "PUT", body)
    if (!response) throw new Error("Erreur lors de la mise à jour du profil")
    return response
}

/** Met à jour le mot de passe de l'utilisateur connecté */
export async function updatePassword(currentPassword: string, newPassword: string): Promise<ProfileResponse> {
    const response = await fetchWithAuth<ProfileResponse>("/auth/password", "PUT", { currentPassword, newPassword })
    if (!response) throw new Error("Erreur lors de la mise à jour du mot de passe")
    return response
}

/**
 * Récupère tous les projets de l'utilisateur connecté.
 * Pour chaque projet ayant des tâches, récupère également les tâches associées
 * en parallèle via Promise.all pour optimiser les performances.
 */
export async function getProjects(): Promise<ProjectsResponse> {
    const response = await fetchWithAuth<ProjectsResponse>("/projects", "GET")
    if (!response) throw new Error("Erreur lors de la récupération des projets")

    await Promise.all(response.projects.map(async project => {
        if (project._count.tasks > 0) {
            project.tasks = await getProjectTasks(project.id)
        }
    }))

    return response
}

/** Récupère les tâches assignées à l'utilisateur connecté */
export async function getAssignedTasks(): Promise<AssignedTasksResponse> {
    const response = await fetchWithAuth<AssignedTasksResponse>("/dashboard/assigned-tasks", "GET")
    if (!response) throw new Error("Erreur lors de la récupération des tâches assignées")
    return response
}

/** Récupère toutes les tâches d'un projet spécifique */
export async function getProjectTasks(id: string): Promise<Task[]> {
    const response = await fetchWithAuth<ProjectTasksResponse>(`/projects/${id}/tasks`, "GET")
    if (!response) throw new Error("Erreur lors de la récupération des tâches du projet")
    return response.tasks
}