"use client"
import {type JSX, useEffect, useRef, useState} from "react"
import {Project, User} from "@/types"
import "@/styles/modale.css"
import {createProject, deleteProject, updateProject} from "@/service/projectService";
import {useUserContext} from "@/context/UserContext";
import Image from "next/image";

interface ProjectModalProps {
    onClose: () => void
    type: string
    user?: User
    project?: Project
    onSuccess?: (project: Project) => void
    onDelete?: () => void
}

export default function ProjectModale({ onClose, type, user, project, onSuccess, onDelete }: ProjectModalProps): JSX.Element {
    const { loadUserData } = useUserContext()
    const [title, setTitle] = useState<string>(type === "update" && project ? project.name : "")
    const [description, setDescription] = useState<string>(type === "update" && project ? project.description : "")
    const modalRef = useRef<HTMLDivElement>(null)


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
        if (!title.trim() || !description.trim()) return
        try {
            if (type === "add") {
                await createProject(title, description)
            } else {
                const updated = await updateProject(project!.id, title, description)
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
            await deleteProject(project!.id)
            await loadUserData()
            onClose()
            onDelete?.()
        } catch (error) {
            console.error(error)
        }
    }

    const isValid = title.trim() !== "" && description.trim() !== ""
    const canBeDeleted = project?.ownerId === user?.id && type === "update";

    return (
        <dialog className="modalBackdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <section className="modal" ref={modalRef}>
                <button className="modalClose" onClick={onClose} aria-label="Fermer la modale">✕</button>
                <h2 className="modalTitle">{type === "add" ? "Créer un projet" : "Modifier un projet"}</h2>

                <form className="modalForm">
                    <label htmlFor="project-title">Titre*</label>
                    <input id="project-title" type="text" value={title} onChange={e => setTitle(e.target.value)} />

                    <label htmlFor="project-description">Description*</label>
                    <input id="project-description" type="text" value={description} onChange={e => setDescription(e.target.value)} />

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