"use client"

import { useUserContext } from "@/context/UserContext"
import {type JSX, useMemo, useState} from "react";
import "@/styles/dashboard.css"
import Image from "next/image";
import {Task} from "@/types";
import DashboardTaskCard from "@/ui/DashboardTaskCard";
import Link from "next/link";

export default function Dashboard() : JSX.Element{
    const { user, assignedTasks, isLoading } = useUserContext();

    const [displayOption, setDisplayOption] = useState<string>("liste");
    const [searchValue, setSearchValue] = useState<string>("");

    const filteredTasks: Task[] = useMemo(() => {
        return [...assignedTasks]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .filter((task) => task.title.toLowerCase().includes(searchValue.toLowerCase()))
    }, [assignedTasks, searchValue])

    const tasksByStatus = useMemo(() => ({
        TODO: filteredTasks.filter(t => t.status === "TODO"),
        IN_PROGRESS: filteredTasks.filter(t => t.status === "IN_PROGRESS"),
        DONE: filteredTasks.filter(t => t.status === "DONE"),
    }), [filteredTasks])

    const handleDisplayOptionsChange = (option: string) => {
        setDisplayOption(option);
        setSearchValue("");
    }

    const handleSearchChange = (value: string) => {
        setSearchValue(value)
    }

    if (isLoading) return <p>Chargement...</p>

    return (
        <div className="mainWrapper">
            <section className="dashboardHeader">
                <div>
                    <h1>Tableau de bord</h1>
                    <p>Bonjour {user?.name}, voici un aperçu de vos projets et tâches</p>
                </div>
                <Link href="/projects">
                    <button>+ Créer un projet</button>
                </Link>
            </section>

            <section className="displayOptions">
                <button
                    className={"option " + (displayOption == "liste" ? "activeOption" : "")}
                    onClick={() => handleDisplayOptionsChange("liste")}
                >
                    <Image
                        src="/icons/liste.svg"
                        alt="Icon liste"
                        width={20}
                        height={20}
                        className={"optionImage"}
                    />
                    Liste
                </button>
                <button
                    className={"option " + (displayOption == "kanban" ? "activeOption" : "")}
                    onClick={() => handleDisplayOptionsChange("kanban")}
                >
                    <Image
                        src="/icons/kanban.svg"
                        alt="Icon kanban"
                        width={20}
                        height={20}
                        className={"optionImage"}
                    />
                    Kanban
                </button>
            </section>

            {displayOption === "liste" && (
                <section className="tasksListWrapper">
                    <article className="tasksListHeader">
                        <div>
                            <h2>Mes tâches assignées</h2>
                            <p>Par ordre de priorité</p>
                        </div>
                        <span className="searchBar">
                            <input
                                type="text"
                                placeholder="Rechercher une tâche"
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            <Image
                                src="/icons/search.svg"
                                alt="Icon loupe"
                                width={15}
                                height={15}
                            />
                        </span>
                    </article>
                    {filteredTasks.map((t: Task): JSX.Element => {
                        return (
                            <DashboardTaskCard key={t.id} task={t}/>
                        )}
                    )}
                </section>
            ) || (
                <section className="tasksListWrapper kanbanVue">
                        {[
                            { key: "TODO" as const, label: "À faire", color: "red" },
                            { key: "IN_PROGRESS" as const, label: "En cours", color: "yellow" },
                            { key: "DONE" as const, label: "Terminées", color: "green" },
                        ].map(({ key, label, color }) => (
                            <section key={key} className={"kanbanColumn " + color}>
                                <div className="kanbanColumnHeader">
                                    <h3>{label}</h3>
                                    <span className="kanbanCount">{tasksByStatus[key].length}</span>
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