import Cookies from "js-cookie"
import {Task} from "@/types"

const BASE_URL = "http://localhost:8000"

interface TaskResponse {
    task: Task
}

async function fetchWithAuth<T>(endpoint: string, method: string, body?: object): Promise<T | null> {
    const token = Cookies.get("token")
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        method: method
    })

    if (!response.ok) throw new Error(`Erreur lors de la requête ${endpoint}`)

    const text = await response.text()
    return text ? JSON.parse(text).data : null
}

export async function createTask(projectId: string, name: string, description: string, dueDate?: string, status?: string): Promise<Task> {
    let dueDateToISO;
    if (dueDate) {
        dueDateToISO = new Date(dueDate).toISOString()
    }
    else{
        dueDateToISO = new Date()
    }

    const response = await fetchWithAuth<Task>(`/projects/${projectId}/tasks`, "POST", {
        title: name,
        description: description,
        dueDate: dueDateToISO,
        status: status
    })
    if (!response) throw new Error("Erreur lors de la création du projet")
    return response
}

export async function updateTask(projectId: string, taskId: string, name: string, description: string, dueDate: string, status: string): Promise<Task> {
    const response = await fetchWithAuth<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`, "PUT", {
        title: name,
        description: description,
        dueDate: new Date(dueDate).toISOString(),
        status: status
    })
    if (!response) throw new Error("Erreur lors de la modification du projet")
    return response.task
}

export async function deleteTask(projectId: string, taskId: string) {
    const reponse = await fetchWithAuth(`/projects/${projectId}/tasks/${taskId}`, "DELETE")

    return reponse;
}