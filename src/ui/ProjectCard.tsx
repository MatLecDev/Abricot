import type {Project, User} from "@/types";
import {convertUserRole, getProgression, getTasksDone} from "@/utils/projectUtils";
import {getInitials} from "@/utils/stringUtils";
import "@/styles/projectCard.css"
import Image from "next/image";

/** Carte de projet affichée dans la grille de la page /projects */
export default function ProjectCard({project, user}: {project: Project, user: User}){
    const tasksDone = getTasksDone(project)
    const progression = getProgression(tasksDone, project._count.tasks)

    return (
        <article className="project" aria-label={`Projet : ${project.name}`}>
            <h2>{project.name}</h2>
            <p className="projectDescription">{project.description}</p>

            {/* Barre de progression des tâches */}
            <div className="projectProgression" aria-label={`Progression : ${progression}%`}>
                <span className="projectProgressionHeader">
                    <h3>Progression</h3>
                    <p className="progressionPourcentage" aria-hidden="true">{progression}%</p>
                </span>
                <span
                    className="projectProgressionBar"
                    role="progressbar"
                    aria-valuenow={progression}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${progression}% des tâches terminées`}
                    style={{ background: `linear-gradient(to right, var(--main-orange) ${progression}%, var(--light-gray) ${progression}%)` }}
                />
                <span aria-label={`${tasksDone} tâches terminées sur ${project._count.tasks}`}>
                    {tasksDone}/{project._count.tasks} tâches terminées
                </span>
            </div>

            {/* Liste des membres de l'équipe */}
            <div className="projectTeam">
                <h3>
                    <Image src="/icons/team.svg" alt="" aria-hidden="true" width={15} height={15} />
                    Équipe ({project.members.length})
                </h3>
                <span className="projectMembers" aria-label="Membres de l'équipe">
                    {/* Utilisateur connecté affiché en premier avec son rôle */}
                    <p aria-label={`Vous : ${getInitials(user.name)}`}>{getInitials(user.name)}</p>
                    <p className="role">{convertUserRole(project.userRole)}</p>

                    {/* Autres contributeurs du projet */}
                    <div className="contributor">
                        {project.members.map((member) => {
                            if (member.user.id !== user.id){
                                return(
                                    <p
                                        key={member.id}
                                        aria-label={`Membre : ${member.user.name}`}
                                    >
                                        {getInitials(member.user.name)}
                                    </p>
                                )
                            }
                            return null
                        })}
                    </div>
                </span>
            </div>
        </article>
    )
}