'use client'
import { type JSX, useState } from "react";
import { useUserContext } from "@/context/UserContext";
import "@/styles/projects.css"
import ProjectCard from "@/ui/ProjectCard";
import ProjectModale from "@/ui/ProjectModale";
import { toSlug } from "@/utils/stringUtils";
import Link from "next/link";

/** Page listant tous les projets de l'utilisateur connecté sous forme de grille */
export default function Projects(): JSX.Element | null {
    const { projects, user } = useUserContext();
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Ne rend rien tant que l'utilisateur n'est pas chargé
    if (!user) return null

    return (
        <div className="mainWrapper">
            {/* Modale de création de projet — montée uniquement quand isModalOpen est true */}
            {isModalOpen && (
                <ProjectModale
                    onClose={() => setIsModalOpen(false)}
                    type="add"
                />
            )}

            <section className="projectsHeader" aria-labelledby="projects-title">
                <div>
                    <h1 id="projects-title">Mes projets</h1>
                    <p>Gérer vos projets</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Créer un nouveau projet"
                >
                    + Créer un projet
                </button>
            </section>

            {/* Grille des projets — chaque carte est un lien vers la page de détail */}
            <section
                className="projectsGrid"
                aria-label={`Liste de vos projets (${projects.length} projet(s))`}
            >
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${toSlug(project.name, project.id)}`}
                        aria-label={`Voir le projet : ${project.name}`}
                    >
                        <ProjectCard project={project} user={user} />
                    </Link>
                ))}
            </section>
        </div>
    )
}