"use client"

import { useUserContext } from "@/context/UserContext"
import { type JSX, useMemo, useState } from "react";
import "@/styles/dashboard.css"
import Image from "next/image";
import { Task } from "@/types";
import DashboardTaskCard from "@/ui/DashboardTaskCard";
import Link from "next/link";

/** Tableau de bord principal affichant les tâches assignées en vue liste ou kanban */
export default function Dashboard(): JSX.Element {
    const { user, assignedTasks, isLoading } = useUserContext();

    // Option d'affichage active : "liste" ou "kanban"
    const [displayOption, setDisplayOption] = useState<string>("liste");
    const [searchValue, setSearchValue] = useState<string>("");

    /**
     * Tâches filtrées par recherche et triées par date d'échéance croissante.
     * Recalculé uniquement quand assignedTasks ou searchValue change.
     */
    const filteredTasks: Task[] = useMemo(() => {
        return [...assignedTasks]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .filter((task) => task.title.toLowerCase().includes(searchValue.toLowerCase()))
    }, [assignedTasks, searchValue])

    /**
     * Tâches regroupées par statut pour la vue kanban.
     * Recalculé uniquement quand filteredTasks change.
     */
    const tasksByStatus = useMemo(() => ({
        TODO: filteredTasks.filter(t => t.status === "TODO"),
        IN_PROGRESS: filteredTasks.filter(t => t.status === "IN_PROGRESS"),
        DONE: filteredTasks.filter(t => t.status === "DONE"),
    }), [filteredTasks])

    /** Bascule entre les modes d'affichage et réinitialise la recherche */
    const handleDisplayOptionsChange = (option: string) => {
        setDisplayOption(option);
        setSearchValue("");
    }

    if (isLoading) return <p role="status" aria-live="polite">Chargement...</p>

    return (
        <div className="mainWrapper">
            {/* En-tête du tableau de bord */}
            <section className="dashboardHeader" aria-labelledby="dashboard-title">
                <div>
                    <h1 id="dashboard-title">Tableau de bord</h1>
                    <p aria-live="polite">Bonjour {user?.name}, voici un aperçu de vos projets et tâches</p>
                </div>
                <Link tabIndex={-1} href="/projects">
                    <button aria-label="Aller sur la page des projets pour en créer un">+ Créer un projet</button>
                </Link>
            </section>

            {/* Sélecteur de mode d'affichage : liste ou kanban */}
            <section className="displayOptions" role="group" aria-label="Mode d'affichage des tâches">
                <button
                    className={"option " + (displayOption == "liste" ? "activeOption" : "")}
                    onClick={() => handleDisplayOptionsChange("liste")}
                    aria-pressed={displayOption === "liste"}
                    aria-label="Affichage en liste"
                >
                    <Image src="/icons/liste.svg" alt="" aria-hidden="true" width={20} height={20} className="optionImage" />
                    Liste
                </button>
                <button
                    className={"option " + (displayOption == "kanban" ? "activeOption" : "")}
                    onClick={() => handleDisplayOptionsChange("kanban")}
                    aria-pressed={displayOption === "kanban"}
                    aria-label="Affichage en kanban"
                >
                    <Image src="/icons/kanban.svg" alt="" aria-hidden="true" width={20} height={20} className="optionImage" />
                    Kanban
                </button>
            </section>

            {/* Vue liste */}
            {displayOption === "liste" ? (
                <section className="tasksListWrapper" aria-labelledby="tasks-title">
                    <article className="tasksListHeader">
                        <div>
                            <h2 id="tasks-title">Mes tâches assignées</h2>
                            <p>Par ordre de priorité</p>
                        </div>
                        {/* Barre de recherche */}
                        <span className="searchBar" role="search">
                            <input
                                type="text"
                                placeholder="Rechercher une tâche"
                                aria-label="Rechercher parmi vos tâches"
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <Image src="/icons/search.svg" alt="" aria-hidden="true" width={15} height={15} />
                        </span>
                    </article>
                    {/* Liste des tâches filtrées */}
                    {filteredTasks.map((t: Task): JSX.Element => (
                        <DashboardTaskCard key={t.id} task={t} />
                    ))}
                </section>
            ) : (
                /* Vue kanban — colonnes par statut */
                <section className="tasksListWrapper kanbanVue" aria-label="Vue kanban des tâches">
                    {[
                        { key: "TODO" as const, label: "À faire", color: "red" },
                        { key: "IN_PROGRESS" as const, label: "En cours", color: "yellow" },
                        { key: "DONE" as const, label: "Terminées", color: "green" },
                    ].map(({ key, label, color }) => (
                        <section
                            key={key}
                            className={"kanbanColumn " + color}
                            aria-labelledby={`kanban-${key}`}
                        >
                            <div className="kanbanColumnHeader">
                                <h3 id={`kanban-${key}`}>{label}</h3>
                                <span
                                    className="kanbanCount"
                                    aria-label={`${tasksByStatus[key].length} tâche(s)`}
                                >
                                    {tasksByStatus[key].length}
                                </span>
                            </div>
                            {tasksByStatus[key].map((t: Task) => (
                                <DashboardTaskCard key={t.id} task={t} />
                            ))}
                        </section>
                    ))}
                </section>
            )}
        </div>
    )
}