'use client'
import { type JSX, useMemo, useState } from "react";
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

export default function ProjectDetail(): JSX.Element | null {
    const { projects, user } = useUserContext();
    const { slug } = useParams<{ slug: string }>()
    const router = useRouter()

    const [searchValue, setSearchValue] = useState<string>("");
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [modalType, setModalType] = useState<string>("");
    const [activeTask, setActiveTask] = useState<Task>();

    const activeProject = useMemo(() => {
        const id = slug.split("-").pop()
        return projects.find(p => p.id === id)
    }, [projects, slug])

    const filteredTasks: Task[] = useMemo(() => {
        if (!activeProject?.tasks) return [];
        return [...activeProject.tasks]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .filter((task) => task.title.toLowerCase().includes(searchValue.toLowerCase()))
    }, [activeProject, searchValue]);

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
            {isProjectModalOpen && (
                <ProjectModale
                    onClose={() => setIsProjectModalOpen(false)}
                    type={modalType}
                    user={user}
                    project={activeProject}
                    onSuccess={() => {return}}
                    onDelete={() => router.push("/projects")}
                />
            )}
            {isTaskModalOpen && (
                <TaskModale
                    onClose={() => setIsTaskModalOpen(false)}
                    type={modalType}
                    task={activeTask!}
                    project={activeProject}
                    onSuccess={() => {return}}
                    onDelete={() => router.push(`/projects/${slug.split("-").pop()}`)}
                />
            )}
            {isAIModalOpen && (
                <AITaskModal
                    project={activeProject}
                    onClose={() => setIsAIModalOpen(false)}
                />
            )}
            <section className="activeProjectHeader">
                <button className="goBackBtn" onClick={() => router.push("/projects")}>←</button>
                <div className="activeProjectTitle">
                    <h1>
                        {activeProject.name + " "}
                        <button onClick={() => handleModalOpen("update", "project")}>Modifier</button>
                    </h1>
                    <p className="activeProjectDescription">{activeProject.description}</p>
                </div>
                <div className="activeProjectButtons">
                    <button className="addTaskBtn" onClick={() => handleModalOpen("add", "task")}>Créer une tâche</button>
                    <button className="iaBtn" onClick={() => setIsAIModalOpen(true)}>
                        <Image
                            src="/icons/ia-white.svg"
                            alt="IA Icon"
                            width={15}
                            height={15}
                        />
                        IA
                    </button>
                </div>
            </section>
            <section className="contributorsListWrapper">
                <h2 className="contributorsListTitle">
                    Contributeurs <span className="totalOfMumbers">{activeProject.members.length} personnes</span>
                </h2>
                <div className="contributorsList">
                    <span className="singleContributor activeUserContributor">
                        <p>{getInitials(user.name)}</p>
                        <p>{convertUserRole(activeProject.userRole)}</p>
                    </span>
                    {activeProject.members.map((member) => {
                        if (member.user.id !== user.id) {
                            return (
                                <span key={member.id} className="singleContributor">
                                    <p>{getInitials(member.user.name)}</p>
                                    <p>{member.user.name}</p>
                                </span>
                            )
                        }
                        return null
                    })}
                </div>
            </section>
            <section className="activeProjectTasks">
                <div className="activeProjectTasksHeader">
                    <span>
                        <h2>Tâches</h2>
                        <p>Par ordre de priorité</p>
                    </span>
                    <span className="searchBar">
                        <input
                            type="text"
                            placeholder="Rechercher une tâche"
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <Image src="/icons/search.svg" alt="Icon loupe" width={15} height={15} />
                    </span>
                </div>
                {filteredTasks.map((task) => (
                    <ProjectTaskCard task={task} members={activeProject.members} key={task.id} onEditAction={(task) => handleModalOpen("update", "task", task)}/>
                ))}
            </section>
        </div>
    )
}