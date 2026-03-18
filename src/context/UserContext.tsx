"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { User, Project, Task } from "@/types"
import Cookies from "js-cookie"
import {getProfile, getProjects, getAssignedTasks} from "@/service/userDataService";

/** Définition des données et fonctions exposées par le contexte */
interface UserContextType {
    user: User | null
    projects: Project[]
    assignedTasks: Task[]
    loadUserData: () => Promise<void>
    isLoading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

/**
 * Provider du contexte utilisateur.
 * Charge et centralise les données de l'utilisateur connecté
 * afin de les rendre accessibles à toute l'application.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

    /**
     * Charge toutes les données de l'utilisateur en parallèle
     * via Promise.all pour optimiser les performances.
     */
    async function loadUserData() {
        setIsLoading(true)
        try {
            const [userData, projectsData, assignedTasksData] = await Promise.all([
                getProfile(),
                getProjects(),
                getAssignedTasks(),
            ])
            setUser(userData.user)
            setProjects(projectsData.projects)
            setAssignedTasks(assignedTasksData.tasks)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Chargement initial : uniquement si un token est présent dans les cookies
    useEffect(() => {
        const token = Cookies.get("token")
        if (token) {
            loadUserData().catch((err) => console.log(err))
        } else {
            // Pas de token : on passe isLoading à false sans charger de données
            setIsLoading(false)
        }
    }, [])

    return (
        <UserContext.Provider value={{ user, projects, assignedTasks, loadUserData, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

/**
 * Hook personnalisé pour consommer le contexte utilisateur.
 * Lance une erreur si utilisé en dehors du UserProvider.
 */
export function useUserContext() {
    const context = useContext(UserContext)
    if (!context) throw new Error("useUser doit être utilisé dans un UserProvider")
    return context
}