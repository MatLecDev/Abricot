"use client"
import { type JSX, useRef, useState } from "react"
import {Project, Task, User} from "@/types"
import "@/styles/modale.css"
import {useUserContext} from "@/context/UserContext";
import {toInputDate} from "@/utils/taskUtils";
import {createTask, deleteTask, updateTask} from "@/service/taskService";
import Image from "next/image";
import {useModalKeyboard} from "@/hooks/useModalKeyboard";
import {createBackdropClickHandler} from "@/utils/modalUtils";

interface ProjectModalProps {
    onClose: () => void
    type: string
    task?: Task
    user?: User
    project?: Project
    onDelete?: () => void
}

/** Modale de création, modification et suppression de tâche */
export default function TaskModale({ onClose, type, user, task, project, onDelete }: ProjectModalProps): JSX.Element {
    const { loadUserData } = useUserContext()

    // Initialisation des champs avec les valeurs existantes en mode modification
    const [title, setTitle] = useState<string>(type === "update" && task ? task.title : "")
    const [description, setDescription] = useState<string>(type === "update" && task ? task.description : "")
    const [date, setDate] = useState<string>(type === "update" && task ? toInputDate(task.dueDate) : "")
    const [status, setStatus] = useState<string>(type === "update" && task ? task.status : "")

    const modalRef = useRef<HTMLDivElement>(null)

    // Focus trap + fermeture par Echap via le hook partagé
    useModalKeyboard(modalRef, onClose)

    // Fermeture au clic sur le backdrop via l'utilitaire partagé
    const handleBackdropClick = createBackdropClickHandler(onClose)

    // Options de statut disponibles pour une tâche
    const statusOptions = [
        { value: "TODO", label: "À faire", className: "TODO" },
        { value: "IN_PROGRESS", label: "En cours", className: "IN_PROGRESS" },
        { value: "DONE", label: "Terminée", className: "DONE" },
    ]

    /** Crée ou met à jour la tâche selon le type de modale */
    const handleSubmit = async () => {
        if (!title.trim() || !description?.trim() || !date?.toString().trim() || !status?.trim()) return
        try {
            if (type === "add") {
                await createTask(project ? project.id : "", title, description, date, status)
            } else {
                await updateTask(project ? project.id : "", task ? task.id : "", title, description, date, status)
            }
            await loadUserData()
            onClose()
        } catch (error) {
            console.error(error)
        }
    }

    /** Supprime définitivement la tâche */
    const handleDelete = async () => {
        try {
            await deleteTask(project ? project.id : "", task ? task.id : "")
            await loadUserData()
            onClose()
            onDelete?.()
        } catch (error) {
            console.error(error)
        }
    }

    const isValid = title.trim() !== "" && description?.trim() !== "" && date?.toString().trim() !== "" && status?.trim() !== ""
    const canBeDeleted = task?.project?.ownerId === user?.id && type === "update"

    return (
        <dialog
            className="modalBackdrop"
            onClick={handleBackdropClick}
            aria-modal="true"
            aria-labelledby="task-modal-title"
        >
            <section className="modal" ref={modalRef}>
                <button className="modalClose" onClick={onClose} aria-label="Fermer la modale">✕</button>
                <h2 id="task-modal-title" className="modalTitle">
                    {type === "add" ? "Créer une tâche" : "Modifier"}
                </h2>

                <form className="modalForm" aria-label={type === "add" ? "Formulaire de création de tâche" : "Formulaire de modification de tâche"}>
                    <label htmlFor="task-title">Titre*</label>
                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        aria-required="true"
                    />

                    <label htmlFor="task-description">Description*</label>
                    <input
                        id="task-description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        aria-required="true"
                    />

                    <label htmlFor="task-date">Échéance*</label>
                    <input
                        id="task-date"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        aria-required="true"
                    />

                    {/* Sélecteur de contributeurs — fonctionnalité à implémenter */}
                    <label id="task-contributors-label">Contributeurs</label>
                    <button
                        className="dropdownToggle"
                        type="button"
                        aria-labelledby="task-contributors-label"
                        aria-haspopup="listbox"
                    >
                        {project
                            ? `${project.members.length} contributeur(s) sélectionné(s)`
                            : "Choisir un ou plusieurs collaborateurs"
                        }
                        <Image src="/icons/chevron.svg" alt="" aria-hidden="true" width={15} height={15} />
                    </button>

                    {/* Sélecteur de statut sous forme de boutons visuels */}
                    <span
                        className="statusSelector"
                        role="group"
                        aria-label="Statut de la tâche"
                    >
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`statusOption ${option.className} ${status === option.value ? "statusOptionActive" : ""}`}
                                onClick={() => setStatus(option.value)}
                                aria-pressed={status === option.value}
                                aria-label={`Statut : ${option.label}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </span>

                    <div className="modalSubmit">
                        <button
                            className={`modalSubmitBtn ${isValid ? "modalSubmitBtnActive" : ""}`}
                            onClick={handleSubmit}
                            disabled={!isValid}
                            aria-disabled={!isValid}
                        >
                            {type === "add" ? "Ajouter une tâche" : "Enregistrer"}
                        </button>

                        {/* Bouton de suppression visible uniquement pour le propriétaire en mode modification */}
                        {canBeDeleted && (
                            <button
                                className="deleteIcon"
                                onClick={handleDelete}
                                aria-label={`Supprimer définitivement la tâche : ${task?.title}`}
                                type="button"
                            >
                                <Image src="/icons/delete.svg" alt="" aria-hidden="true" width={50} height={50} />
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </dialog>
    )
}