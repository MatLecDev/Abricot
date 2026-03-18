'use client'
import { type JSX, useEffect, useMemo, useState } from "react";
import { useUserContext } from "@/context/UserContext";
import { Task } from "@/types";
import { getInitials } from "@/utils/stringUtils";
import { convertUserRole } from "@/utils/projectUtils";
import Image from "next/image";
import ProjectTaskCard from "@/ui/ProjectTaskCard";
import ProjectModale from "@/ui/ProjectModale";
import { useParams, useRouter } from "next/navigation";
import "@/styles/projectDetail.css"
import TaskModale from "@/ui/TaskModale";
import AITaskModal from "@/ui/AITaskModale";

/** Page de détail d'un projet : liste des tâches, membres et actions */
export default function ProjectDetail(): JSX.Element | null {
    const { projects, user, isLoading } = useUserContext();
    const { slug } = useParams<{ slug: string }>()
    const router = useRouter()

    const [searchValue, setSearchValue] = useState<string>("");
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [modalType, setModalType] = useState<string>("");
    const [activeTask, setActiveTask] = useState<Task>();

    /**
     * Retrouve le projet actif depuis le contexte en extrayant l'id
     * depuis la fin du slug (format: "nom-du-projet-{id}")
     */
    const activeProject = useMemo(() => {
        const id = slug.split("-").pop()
        return projects.find(p => p.id === id)
    }, [projects, slug])

    /**
     * Vérifie les droits d'accès une fois le chargement terminé.
     * Redirige vers /projects si l'utilisateur n'est pas membre du projet.
     */
    useEffect(() => {
        if (isLoading) return
        if (!activeProject || !user) {
            router.push("/projects")
            return
        }
        if (activeProject.ownerId !== user.id && !activeProject.members.some(member => member.userId === user.id)) {
            router.push("/projects")
        }
    }, [activeProject, user, router, isLoading])

    /**
     * Tâches du projet filtrées par recherche et triées par date d'échéance croissante.
     */
    const filteredTasks: Task[] = useMemo(() => {
        if (!activeProject?.tasks) return [];
        return [...activeProject.tasks]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .filter((task) => task.title.toLowerCase().includes(searchValue.toLowerCase()))
    }, [activeProject, searchValue]);

    /**
     * Ouvre la modale appropriée selon le type d'action demandé.
     * @param type - "add" ou "update"
     * @param modale - "project" ou "task"
     * @param task - Tâche concernée (uniquement pour les actions sur les tâches)
     */
    const handleModalOpen = (type: string, modale: string, task?: Task) => {
        setModalType(type)
        if (modale === "project") {
            setIsProjectModalOpen(true)
        } else if (modale === "task") {
            setActiveTask(task)
            setIsTaskModalOpen(true)
        }
    }

    if (!user || !activeProject) return null

    return (
        <div className="mainWrapper">
            {/* Modale de modification/suppression du projet */}
            {isProjectModalOpen && (
                <ProjectModale
                    onClose={() => setIsProjectModalOpen(false)}
                    type={modalType}
                    user={user}
                    project={activeProject}
                    onDelete={() => router.push("/projects")}
                />
            )}

            {/* Modale de création/modification de tâche */}
            {isTaskModalOpen && (
                <TaskModale
                    onClose={() => setIsTaskModalOpen(false)}
                    type={modalType}
                    task={activeTask!}
                    project={activeProject}
                    onDelete={() => router.push(`/projects/${slug.split("-").pop()}`)}
                />
            )}

            {/* Modale de génération de tâches par IA */}
            {isAIModalOpen && (
                <AITaskModal
                    project={activeProject}
                    onClose={() => setIsAIModalOpen(false)}
                />
            )}

            {/* En-tête du projet */}
            <section className="activeProjectHeader" aria-labelledby="project-title">
                <button className="goBackBtn" onClick={() => router.push("/projects")} aria-label="Retour à la liste des projets">←</button>
                <div className="activeProjectTitle">
                    <span>
                        <h1 id="project-title">{activeProject.name}</h1>
                        {/* Bouton de modification visible uniquement pour le propriétaire */}
                        {activeProject.ownerId === user.id && (
                            <button
                                onClick={() => handleModalOpen("update", "project")}
                                aria-label={`Modifier le projet : ${activeProject.name}`}
                            >
                                Modifier
                            </button>
                        )}
                    </span>
                    <p className="activeProjectDescription">{activeProject.description}</p>
                </div>
                <div className="activeProjectButtons">
                    <button
                        className="addTaskBtn"
                        onClick={() => handleModalOpen("add", "task")}
                        aria-label="Créer une nouvelle tâche"
                    >
                        Créer une tâche
                    </button>
                    <button
                        className="iaBtn"
                        onClick={() => setIsAIModalOpen(true)}
                        aria-label="Générer des tâches avec l'intelligence artificielle"
                    >
                        <Image src="/icons/ia-white.svg" alt="" aria-hidden="true" width={15} height={15} />
                        IA
                    </button>
                </div>
            </section>

            {/* Liste des contributeurs */}
            <section className="contributorsListWrapper" aria-labelledby="contributors-title">
                <h2 id="contributors-title" className="contributorsListTitle">
                    Contributeurs
                    <span className="totalOfMumbers" aria-label={`${activeProject.members.length} personnes`}>
                        {activeProject.members.length} personnes
                    </span>
                </h2>
                <div className="contributorsList" role="list">
                    {/* Utilisateur connecté affiché en premier */}
                    <span className="singleContributor activeUserContributor" role="listitem" aria-label={`Vous : ${user.name}, ${convertUserRole(activeProject.userRole)}`}>
                        <p aria-hidden="true">{getInitials(user.name)}</p>
                        <p>{convertUserRole(activeProject.userRole)}</p>
                    </span>

                    {/* Autres membres du projet */}
                    {activeProject.members.map((member) => {
                        if (member.user.id !== user.id) {
                            return (
                                <span key={member.id} className="singleContributor" role="listitem" aria-label={member.user.name}>
                                    <p aria-hidden="true">{getInitials(member.user.name)}</p>
                                    <p>{member.user.name}</p>
                                </span>
                            )
                        }
                        return null
                    })}
                </div>
            </section>

            {/* Section des tâches du projet */}
            <section className="activeProjectTasks" aria-labelledby="tasks-title">
                <div className="activeProjectTasksHeader">
                    <span>
                        <h2 id="tasks-title">Tâches</h2>
                        <p>Par ordre de priorité</p>
                    </span>
                    {/* Barre de recherche dans les tâches */}
                    <span className="searchBar" role="search">
                        <input
                            type="text"
                            placeholder="Rechercher une tâche"
                            aria-label="Rechercher parmi les tâches du projet"
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <Image src="/icons/search.svg" alt="" aria-hidden="true" width={15} height={15} />
                    </span>
                </div>

                {/* Liste des tâches filtrées */}
                {filteredTasks.map((task) => (
                    <ProjectTaskCard
                        task={task}
                        members={activeProject.members}
                        key={task.id}
                        onEditAction={(task) => handleModalOpen("update", "task", task)}
                    />
                ))}
            </section>
        </div>
    )
}