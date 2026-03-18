"use client"
import { type JSX, useRef, useState } from "react"
import { Project, Task } from "@/types"
import { generateTasks } from "@/service/mistralService"
import { createTask } from "@/service/taskService"
import { useUserContext } from "@/context/UserContext"
import "@/styles/aiTaskModale.css"
import Image from "next/image";
import {useModalKeyboard} from "@/hooks/useModalKeyboard";
import {createBackdropClickHandler} from "@/utils/modalUtils";

/** Structure d'une tâche proposée par l'IA */
interface AITask {
    title: string
    description: string
}

/** Structure d'un message dans l'historique de conversation */
interface MistralMessage {
    role: "user" | "assistant"
    content: string
}

interface AITaskModalProps {
    project: Project
    onClose: () => void
}

/**
 * Modale de génération de tâches par IA via Mistral.
 * Permet à l'utilisateur de décrire ses besoins en langage naturel,
 * de modifier les tâches proposées, puis de les ajouter au projet.
 */
export default function AITaskModale({ project, onClose }: AITaskModalProps): JSX.Element {
    const { loadUserData } = useUserContext()
    const [userMessage, setUserMessage] = useState("")
    const [proposedTasks, setProposedTasks] = useState<AITask[]>([])

    // Historique des échanges pour permettre les demandes multi-tours
    const [history, setHistory] = useState<MistralMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    // Index de la tâche en cours d'édition (null si aucune)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const modalRef = useRef<HTMLDialogElement>(null)

    // Focus trap + fermeture par Echap via le hook partagé
    // Sélecteur étendu pour inclure les sections et textareas spécifiques à cette modale
    useModalKeyboard(modalRef, onClose, 'section, button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])')

    // Fermeture au clic sur le backdrop via l'utilitaire partagé
    const handleBackdropClick = createBackdropClickHandler(onClose)

    // Titres des tâches existantes pour éviter les doublons dans les suggestions IA
    const existingTaskTitles = project.tasks?.map((t: Task) => t.title) ?? []

    /**
     * Envoie le message à l'IA et ajoute les nouvelles tâches proposées
     * à la liste existante, en tenant compte de l'historique de conversation.
     */
    const handleGenerate = async () => {
        if (!userMessage.trim() || isLoading) return
        setIsLoading(true)

        try {
            // Combine les tâches existantes et déjà proposées pour éviter les doublons
            const allExisting = [
                ...existingTaskTitles,
                ...proposedTasks.map(t => t.title)
            ]
            const newTasks = await generateTasks(userMessage, allExisting, history)

            // Mise à jour de l'historique avec le dernier échange
            setHistory(prev => [
                ...prev,
                { role: "user", content: userMessage },
                { role: "assistant", content: JSON.stringify({ tasks: newTasks }) }
            ])

            // Ajout des nouvelles tâches à la liste existante
            setProposedTasks(prev => [...prev, ...newTasks])
            setUserMessage("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    /** Déclenche la génération via la touche Entrée */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleGenerate()
    }

    /** Met à jour un champ d'une tâche proposée */
    const handleEditTask = (index: number, field: "title" | "description", value: string) => {
        setProposedTasks(prev => prev.map((task, i) =>
            i === index ? { ...task, [field]: value } : task
        ))
    }

    /** Supprime une tâche proposée de la liste */
    const handleDeleteTask = (index: number) => {
        setProposedTasks(prev => prev.filter((_, i) => i !== index))
        if (editingIndex === index) setEditingIndex(null)
    }

    /** Ajoute toutes les tâches proposées au projet via l'API */
    const handleAddAll = async () => {
        if (proposedTasks.length === 0) return
        setIsAdding(true)
        try {
            // Création en parallèle pour optimiser les performances
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

    return (
        <dialog
            className="modalBackdrop"
            onClick={handleBackdropClick}
            aria-modal="true"
            aria-labelledby="ai-modal-title"
            ref={modalRef}
        >
            <section className="aiModal">
                <button className="modalClose" onClick={onClose} aria-label="Fermer la modale">✕</button>

                {/* En-tête de la modale */}
                <span className="aiModalTitle">
                    <Image src="/icons/ia.svg" alt="" aria-hidden="true" width={20} height={20} />
                    <h2 id="ai-modal-title">
                        {proposedTasks.length > 0 ? "Vos tâches..." : "Créer une tâche"}
                    </h2>
                </span>

                {/* Liste des tâches proposées par l'IA */}
                <section className="aiTaskList" aria-label={`${proposedTasks.length} tâche(s) proposée(s)`} aria-live="polite">
                    {proposedTasks.map((task, index) => (
                        <article key={index} className="aiTaskItem" aria-label={`Tâche proposée : ${task.title}`}>
                            {/* Mode édition ou affichage selon editingIndex */}
                            {editingIndex === index ? (
                                <>
                                    <input
                                        className="aiTaskEditTitle"
                                        value={task.title}
                                        onChange={e => handleEditTask(index, "title", e.target.value)}
                                        aria-label="Modifier le titre de la tâche"
                                    />
                                    <textarea
                                        className="aiTaskEditDescription"
                                        value={task.description}
                                        onChange={e => handleEditTask(index, "description", e.target.value)}
                                        aria-label="Modifier la description de la tâche"
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="aiTaskItemTitle">{task.title}</p>
                                    <p className="aiTaskItemDescription">{task.description}</p>
                                </>
                            )}

                            {/* Actions sur la tâche : suppression et modification */}
                            <div className="aiTaskActions">
                                <button
                                    onClick={() => handleDeleteTask(index)}
                                    aria-label={`Supprimer la tâche : ${task.title}`}
                                >
                                    <Image src="/icons/delete-gray.svg" alt="" aria-hidden="true" width={12} height={12} />
                                    Supprimer
                                </button>
                                <span className="separator" aria-hidden="true"></span>
                                <button
                                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                    aria-label={editingIndex === index ? `Valider les modifications de : ${task.title}` : `Modifier la tâche : ${task.title}`}
                                    aria-pressed={editingIndex === index}
                                >
                                    <Image src="/icons/update.svg" alt="" aria-hidden="true" width={12} height={12} />
                                    {editingIndex === index ? "Valider" : "Modifier"}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Bouton d'ajout de toutes les tâches au projet */}
                {proposedTasks.length > 0 && (
                    <>
                        <button
                            className="aiAddAllBtn"
                            onClick={handleAddAll}
                            disabled={isAdding}
                            aria-busy={isAdding}
                            aria-label={`Ajouter les ${proposedTasks.length} tâches au projet`}
                        >
                            {isAdding ? "Ajout en cours..." : "+ Ajouter les tâches"}
                        </button>
                        <span className="border" aria-hidden="true"></span>
                    </>
                )}

                {/* Zone de saisie du prompt utilisateur */}
                <section className="aiInputWrapper">
                    <label htmlFor="ai-prompt" className="sr-only">Décrire les tâches à générer</label>
                    <input
                        id="ai-prompt"
                        className="aiInput"
                        value={userMessage}
                        onChange={e => setUserMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                        disabled={isLoading}
                        aria-busy={isLoading}
                    />
                    <button
                        className="aiSendBtn"
                        onClick={handleGenerate}
                        disabled={!userMessage.trim() || isLoading}
                        aria-label={isLoading ? "Génération en cours..." : "Générer des tâches"}
                        aria-busy={isLoading}
                    >
                        {isLoading ? "..." : "+"}
                    </button>
                </section>
            </section>
        </dialog>
    )
}