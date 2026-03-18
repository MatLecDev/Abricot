import {Task} from "@/types";
import {type JSX} from "react";
import {convertStatus, convertDate} from "@/utils/taskUtils";
import Image from "next/image";
import "@/styles/dashboardTaskCard.css"
import Link from "next/link";
import {toSlug} from "@/utils/stringUtils";

/** Carte affichant un résumé d'une tâche assignée sur le tableau de bord */
export default function DashboardTaskCard({task}: {task: Task}): JSX.Element{
    return (
        <article className="dashboardTask" aria-label={`Tâche : ${task.title}`}>
            <div className="taskHeader">
                <h3>{task.title}</h3>
                {/* Badge de statut avec classe CSS correspondante pour la couleur */}
                <span className={"status " + task.status} aria-label={`Statut : ${convertStatus(task.status)}`}>
                    {convertStatus(task.status)}
                </span>
            </div>

            <p className="taskDescription">{task.description}</p>

            <div className="taskContent">
                <div className="taskContentInfos">
                    {/* Nom du projet associé à la tâche */}
                    <span>
                        <Image src="/icons/projects-gray.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <p aria-label={`Projet : ${task.project.name}`}>{task.project.name.replace("-", "")}</p>
                    </span>

                    {/* Date d'échéance */}
                    <span>
                        <Image src="/icons/date-gray.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <p aria-label={`Échéance : ${convertDate(task.dueDate)}`}>{convertDate(task.dueDate)}</p>
                    </span>

                    {/* Nombre de commentaires */}
                    <span>
                        <Image src="/icons/comments-gray.svg" alt="" aria-hidden="true" width={15} height={15} />
                        <p aria-label={`${task.comments.length} commentaire(s)`}>{task.comments.length}</p>
                    </span>
                </div>

                {/* Lien vers le projet contenant cette tâche */}
                <Link tabIndex={-1} href={"/projects/" + toSlug(task.project.name, task.projectId)}>
                    <button aria-label={`Voir le projet ${task.project.name}`} className="seeTaskBtn">Voir</button>
                </Link>
            </div>
        </article>
    )
}