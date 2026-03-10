"use client"
import { type JSX, useState } from "react"
import { Project, Task } from "@/types"
import { generateTasks } from "@/service/mistralService"
import { createTask } from "@/service/taskService"
import { useUserContext } from "@/context/UserContext"
import "@/styles/aiTaskModale.css"
import Image from "next/image";

interface AITask {
    title: string
    description: string
}

interface MistralMessage {
    role: "user" | "assistant"
    content: string
}

interface AITaskModalProps {
    project: Project
    onClose: () => void
}

export default function AITaskModale({ project, onClose }: AITaskModalProps): JSX.Element {
    const { loadUserData } = useUserContext()
    const [userMessage, setUserMessage] = useState("")
    const [proposedTasks, setProposedTasks] = useState<AITask[]>([])
    const [history, setHistory] = useState<MistralMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const existingTaskTitles = project.tasks?.map((t: Task) => t.title) ?? []

    const handleGenerate = async () => {
        if (!userMessage.trim() || isLoading) return
        setIsLoading(true)

        try {
            const allExisting = [
                ...existingTaskTitles,
                ...proposedTasks.map(t => t.title)
            ]
            const newTasks = await generateTasks(userMessage, allExisting, history)
            setHistory(prev => [
                ...prev,
                { role: "user", content: userMessage },
                { role: "assistant", content: JSON.stringify({ tasks: newTasks }) }
            ])
            setProposedTasks(prev => [...prev, ...newTasks])
            setUserMessage("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleGenerate()
    }

    const handleEditTask = (index: number, field: "title" | "description", value: string) => {
        setProposedTasks(prev => prev.map((task, i) =>
            i === index ? { ...task, [field]: value } : task
        ))
    }

    const handleDeleteTask = (index: number) => {
        setProposedTasks(prev => prev.filter((_, i) => i !== index))
        if (editingIndex === index) setEditingIndex(null)
    }

    const handleAddAll = async () => {
        if (proposedTasks.length === 0) return
        setIsAdding(true)
        try {
            await Promise.all(proposedTasks.map(task =>
                createTask(project.id, task.title, task.description, "", "TODO")
            ))
            await loadUserData()
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setIsAdding(false)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <dialog className="modalBackdrop" onClick={handleBackdropClick}>
            <section className="aiModal">
                <button className="modalClose" onClick={onClose}>✕</button>

                <h2 className="aiModalTitle">
                    <Image
                        src="/icons/ia.svg"
                        alt="Icon IA"
                        width={20}
                        height={20}
                    />
                    {proposedTasks.length > 0 ? "Vos tâches..." : "Créer une tâche"}
                </h2>

                <section className="aiTaskList">
                    {proposedTasks.map((task, index) => (
                        <article key={index} className="aiTaskItem">
                            {editingIndex === index ? (
                                <>
                                    <input
                                        className="aiTaskEditTitle"
                                        value={task.title}
                                        onChange={e => handleEditTask(index, "title", e.target.value)}
                                    />
                                    <textarea
                                        className="aiTaskEditDescription"
                                        value={task.description}
                                        onChange={e => handleEditTask(index, "description", e.target.value)}
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="aiTaskItemTitle">{task.title}</p>
                                    <p className="aiTaskItemDescription">{task.description}</p>
                                </>
                            )}
                            <div className="aiTaskActions">
                                <button onClick={() => handleDeleteTask(index)}>
                                    <Image
                                        src="/icons/delete-gray.svg"
                                        alt="Update icon"
                                        width={12}
                                        height={12}
                                    />
                                    Supprimer
                                </button>
                                <span className="separator"></span>
                                <button onClick={() => setEditingIndex(editingIndex === index ? null : index)}>
                                    <Image
                                        src="/icons/update.svg"
                                        alt="Update icon"
                                        width={12}
                                        height={12}
                                    />
                                    {editingIndex === index ? "Valider" : "Modifier"}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                {proposedTasks.length > 0 && (
                    <>
                        <button className="aiAddAllBtn" onClick={handleAddAll} disabled={isAdding}>
                            {isAdding ? "Ajout en cours..." : "+ Ajouter les tâches"}
                        </button>
                        <span className="border"></span>
                    </>
                )}

                <section className="aiInputWrapper">
                    <input
                        className="aiInput"
                        value={userMessage}
                        onChange={e => setUserMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                        disabled={isLoading}
                    />
                    <button
                        className="aiSendBtn"
                        onClick={handleGenerate}
                        disabled={!userMessage.trim() || isLoading}
                    >
                        {isLoading ? "..." : "+"}
                    </button>
                </section>
            </section>
        </dialog>
    )
}