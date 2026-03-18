import { Task } from "@/types"
import { fetchWithAuth } from "@/service/fetchWithAuth"

/** Structure de la réponse API pour une tâche unique */
interface TaskResponse {
    task: Task
}

/**
 * Crée une nouvelle tâche dans un projet.
 * Si aucune date n'est fournie, utilise la date actuelle par défaut.
 */
export async function createTask(projectId: string, name: string, description: string, dueDate?: string, status?: string): Promise<Task> {
    // Conversion de la date en ISO 8601 attendu par l'API
    const dueDateToISO = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString()

    const response = await fetchWithAuth<Task>(`/projects/${projectId}/tasks`, "POST", {
        title: name,
        description,
        dueDate: dueDateToISO,
        status
    })
    if (!response) throw new Error("Erreur lors de la création de la tâche")
    return response
}

/** Met à jour une tâche existante */
export async function updateTask(projectId: string, taskId: string, name: string, description: string, dueDate: string, status: string): Promise<Task> {
    const response = await fetchWithAuth<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`, "PUT", {
        title: name,
        description,
        dueDate: new Date(dueDate).toISOString(),
        status
    })
    if (!response) throw new Error("Erreur lors de la modification de la tâche")
    return response.task
}

/** Supprime définitivement une tâche */
export async function deleteTask(projectId: string, taskId: string) {
    return fetchWithAuth(`/projects/${projectId}/tasks/${taskId}`, "DELETE")
}