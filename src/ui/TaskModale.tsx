"use client"
import {type JSX, useEffect, useRef, useState} from "react"
import {Project, Task, User} from "@/types"
import "@/styles/modale.css"
import {useUserContext} from "@/context/UserContext";
import {toInputDate} from "@/utils/taskUtils";
import {createTask, deleteTask, updateTask} from "@/service/taskService";
import Image from "next/image";

interface ProjectModalProps {
    onClose: () => void
    type: string
    task?: Task
    user?: User
    project?: Project
    onSuccess?: (project: Project) => void
    onDelete?: () => void
}

export default function TaskModale({ onClose, type, user, task, project, onSuccess, onDelete }: ProjectModalProps): JSX.Element {
    const { loadUserData } = useUserContext()
    const [title, setTitle] = useState<string>(type === "update" && task ? task!.title : "")
    const [description, setDescription] = useState<string>(type === "update" && task ? task!.description : "")
    const [date, setDate] = useState<string>(type === "update" && task ? toInputDate(task!.dueDate) : "")
    const [status, setStatus] = useState<string>(type === "update" && task ? task!.status : "")
    const modalRef = useRef<HTMLDivElement>(null)

    const statusOptions = [
        { value: "TODO", label: "À faire", className: "TODO" },
        { value: "IN_PROGRESS", label: "En cours", className: "IN_PROGRESS" },
        { value: "DONE", label: "Terminée", className: "DONE" },
    ]

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
                return
            }
            if (e.key === "Tab") {
                const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, input, [tabindex]:not([tabindex="-1"])'
                )
                if (!focusable || focusable.length === 0) return
                const first = focusable[0]
                const last = focusable[focusable.length - 1]
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        modalRef.current?.querySelector<HTMLElement>("input")?.focus()

        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
        if (e.target === e.currentTarget) onClose()
    }

    const handleSubmit = async () => {
        if (!title.trim() || !description?.trim() || !date?.toString().trim() || !status?.trim()) return
        try {
            if (type === "add") {
                await createTask(project!.id, title, description, date, status)
            } else {
                const updated = await updateTask(project!.id, task!.id, title, description, date, status)
                onSuccess?.({ ...project!, ...updated })
            }
            await loadUserData()
            onClose()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteTask(project!.id, task!.id)
            await loadUserData()
            onClose()
            onDelete?.()
        } catch (error) {
            console.error(error)
        }
    }

    const isValid = title.trim() !== "" && description?.trim() !== "" && date?.toString().trim() !== "" && status?.trim() !== ""
    const canBeDeleted = task?.project?.ownerId === user?.id && type === "update";

    return (
        <dialog className="modalBackdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <section className="modal" ref={modalRef}>
                <button className="modalClose" onClick={onClose} aria-label="Fermer la modale">✕</button>
                <h2 className="modalTitle">{type === "add" ? "Créer un projet" : "Modifier un projet"}</h2>

                <form className="modalForm">
                    <label htmlFor="task-title">Titre*</label>
                    <input id="task-title" type="text" value={title} onChange={e => setTitle(e.target.value)} />

                    <label htmlFor="task-description">Description*</label>
                    <input id="task-description" type="text" value={description} onChange={e => setDescription(e.target.value)} />

                    <label htmlFor="task-date">Échéance*</label>
                    <input id="task-date" type="date" value={date} onChange={e => setDate(e.target.value)} />

                    <label>Contributeurs</label>
                    <button className="dropdownToggle" type="button">
                        {project && (
                            `${project!.members.length} contributeur(s) sélectionné(s)`
                        ) || (
                            "Choisir un ou plusieurs collaborateurs"
                        )}
                        <Image
                            src="/icons/chevron.svg"
                            alt="chevron icon"
                            width={15}
                            height={15}
                        />
                    </button>

                    <span className="statusSelector">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`statusOption ${option.className} ${status === option.value ? "statusOptionActive" : ""}`}
                                onClick={() => setStatus(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </span>

                    <div className="modalSubmit">
                        <button className={`modalSubmitBtn ${isValid ? "modalSubmitBtnActive" : ""}`} onClick={handleSubmit} disabled={!isValid}>
                            {type === "add" ? "Ajouter un projet" : "Enregistrer"}
                        </button>
                        {canBeDeleted && (
                            <Image
                                src="/icons/delete.svg"
                                alt="delete icon"
                                width={50}
                                height={50}
                                className="deleteIcon"
                                onClick={handleDelete}
                            />
                        )}
                    </div>
                </form>
            </section>
        </dialog>
    )
}