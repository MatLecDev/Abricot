"use client"
import { type JSX, useRef, useState } from "react"
import {Project, User} from "@/types"
import "@/styles/modale.css"
import {createProject, deleteProject, updateProject} from "@/service/projectService";
import {useUserContext} from "@/context/UserContext";
import Image from "next/image";
import {useModalKeyboard} from "@/hooks/useModalKeyboard";
import {createBackdropClickHandler} from "@/utils/modalUtils";

interface ProjectModalProps {
    onClose: () => void
    type: string
    user?: User
    project?: Project
    onDelete?: () => void
}

/**
 * Modale de création et modification de projet.
 * Accessible uniquement au propriétaire du projet (vérifié avant le rendu).
 */
export default function ProjectModale({ onClose, type, user, project, onDelete }: ProjectModalProps): JSX.Element {
    const { loadUserData } = useUserContext()

    // Initialisation des champs avec les valeurs existantes en mode modification
    const [title, setTitle] = useState<string>(type === "update" && project ? project.name : "")
    const [description, setDescription] = useState<string>(type === "update" && project ? project.description : "")

    const modalRef = useRef<HTMLDivElement>(null)

    // Focus trap + fermeture par Echap via le hook partagé
    useModalKeyboard(modalRef, onClose)

    // Fermeture au clic sur le backdrop via l'utilitaire partagé
    const handleBackdropClick = createBackdropClickHandler(onClose)

    /** Crée ou met à jour le projet selon le type de modale */
    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return
        try {
            if (type === "add") {
                await createProject(title, description)
            } else {
                await updateProject(project ? project.id : "", title, description)
            }
            await loadUserData()
            onClose()
        } catch (error) {
            console.error(error)
        }
    }

    /** Supprime définitivement le projet et redirige vers la liste */
    const handleDelete = async () => {
        try {
            await deleteProject(project ? project.id : "")
            await loadUserData()
            onClose()
            onDelete?.()
        } catch (error) {
            console.error(error)
        }
    }

    const isValid = title.trim() !== "" && description.trim() !== ""
    const canBeDeleted = project?.ownerId === user?.id && type === "update"

    // Sécurité : ne rend rien si l'utilisateur n'est pas le propriétaire
    if (project?.ownerId !== user?.id) return <></>

    return (
        <dialog
            className="modalBackdrop"
            onClick={handleBackdropClick}
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <section className="modal" ref={modalRef}>
                <button className="modalClose" onClick={onClose} aria-label="Fermer la modale">✕</button>
                <h2 id="modal-title" className="modalTitle">
                    {type === "add" ? "Créer un projet" : "Modifier un projet"}
                </h2>

                <form className="modalForm" aria-label={type === "add" ? "Formulaire de création de projet" : "Formulaire de modification de projet"}>
                    <label htmlFor="project-title">Titre*</label>
                    <input
                        id="project-title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        aria-required="true"
                    />

                    <label htmlFor="project-description">Description*</label>
                    <input
                        id="project-description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        aria-required="true"
                    />

                    {/* Sélecteur de contributeurs — fonctionnalité à implémenter */}
                    <label id="contributors-label">Contributeurs</label>
                    <button
                        className="dropdownToggle"
                        type="button"
                        aria-labelledby="contributors-label"
                        aria-haspopup="listbox"
                    >
                        {project
                            ? `${project.members.length} contributeur(s) sélectionné(s)`
                            : "Choisir un ou plusieurs collaborateurs"
                        }
                        <Image src="/icons/chevron.svg" alt="" aria-hidden="true" width={15} height={15} />
                    </button>

                    <div className="modalSubmit">
                        <button
                            className={`modalSubmitBtn ${isValid ? "modalSubmitBtnActive" : ""}`}
                            onClick={handleSubmit}
                            disabled={!isValid}
                            aria-disabled={!isValid}
                        >
                            {type === "add" ? "Ajouter un projet" : "Enregistrer"}
                        </button>

                        {/* Bouton de suppression visible uniquement pour le propriétaire en mode modification */}
                        {canBeDeleted && (
                            <button
                                className="deleteIcon"
                                onClick={handleDelete}
                                aria-label={`Supprimer définitivement le projet : ${project?.name}`}
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