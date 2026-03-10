"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { User, Project, Task } from "@/types"
import Cookies from "js-cookie"
import {getProfile, getProjects, getAssignedTasks} from "@/service/userDataService";

interface UserContextType {
    user: User | null
    projects: Project[]
    assignedTasks: Task[]
    loadUserData: () => Promise<void>
    isLoading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

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

    useEffect(() => {
        const token = Cookies.get("token")
        if (token) {
            loadUserData().catch((err) => console.log(err))
        } else {
            setIsLoading(false)
        }
    }, [])

    return (
        <UserContext.Provider value={{ user, projects, assignedTasks, loadUserData, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUserContext() {
    const context = useContext(UserContext)
    if (!context) throw new Error("useUser doit être utilisé dans un UserProvider")
    return context
}