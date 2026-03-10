'use client'
import { type JSX, useState } from "react";
import { useUserContext } from "@/context/UserContext";
import "@/styles/projects.css"
import ProjectCard from "@/ui/ProjectCard";
import ProjectModale from "@/ui/ProjectModale";
import { useRouter } from "next/navigation";
import {toSlug} from "@/utils/stringUtils";

export default function Projects(): JSX.Element | null {
    const { projects, user } = useUserContext();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()

    const handleModalOpen = () => {
        setIsModalOpen(true)
    }

    if (!user) return null

    return (
        <div className="mainWrapper">
            {isModalOpen && (
                <ProjectModale
                    onClose={() => setIsModalOpen(false)}
                    type="add"
                />
            )}
            <section className="projectsHeader">
                <div>
                    <h1>Mes projets</h1>
                    <p>Gérer vos projets</p>
                </div>
                <button onClick={() => handleModalOpen()}>+ Créer un projet</button>
            </section>
            <section className="projectsGrid">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        user={user}
                        setActiveProject={() => router.push(`/projects/${toSlug(project.name, project.id)}`)}
                    />
                ))}
            </section>
        </div>
    )
}