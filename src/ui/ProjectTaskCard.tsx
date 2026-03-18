"use client"

import {ProjectMember, Task} from "@/types";
import {convertDate, convertStatus} from "@/utils/taskUtils";
import {getInitials} from "@/utils/stringUtils";
import Image from "next/image";
import {useState} from "react";
import "@/styles/projectTaskCard.css"

/** Carte affichant les détails d'une tâche dans la vue projet */
export default function ProjectTaskCard({task, members, onEditAction}: {
    task: Task,
    members: ProjectMember[],
    onEditAction: (task: Task) => void
}){
    const [displayComments, setDisplayComments] = useState<boolean>(false);

    return(
        <article className="projectTask" aria-label={`Tâche : ${task.title}`}>
            <div className="taskHeader">
                <span className="taskTitle">
                    <h3>{task.title}</h3>
                    <p className={"status " + task.status} aria-label={`Statut : ${convertStatus(task.status)}`}>
                        {convertStatus(task.status)}
                    </p>
                </span>

                {/* Bouton de modification de la tâche */}
                <button
                    className="updateIcon"
                    onClick={() => onEditAction(task)}
                    aria-label={`Modifier la tâche : ${task.title}`}
                >
                    <Image src="/icons/modify.svg" alt="" aria-hidden="true" width={20} height={5} />
                </button>
            </div>

            <p>{task.description}</p>

            {/* Date d'échéance */}
            <div className="dueDate">
                <h4>Échéance : </h4>
                <span>
                    <Image src="/icons/date-black.svg" alt="" aria-hidden="true" width={20} height={20} />
                    <p aria-label={`Date d'échéance : ${convertDate(task.dueDate)}`}>{convertDate(task.dueDate)}</p>
                </span>
            </div>

            {/* Liste des membres assignés à la tâche */}
            <div className="taskContributors" aria-label="Membres assignés">
                <h4>Assigné à :</h4>
                {members.map((member: ProjectMember) => (
                    <span className="contributor" key={member.id} aria-label={member.user.name}>
                        <p aria-hidden="true">{getInitials(member.user.name)}</p>
                        <p>{member.user.name}</p>
                    </span>
                ))}
            </div>

            {/* Section commentaires avec toggle d'affichage */}
            <div className="projectTasksComments">
                <span className="commentsHeader">
                    <p>{task.comments.length} commentaire(s)</p>
                    <button
                        onClick={() => setDisplayComments(prev => !prev)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        aria-label={displayComments ? "Masquer les commentaires" : "Afficher les commentaires"}
                        aria-expanded={displayComments}
                    >
                        <Image
                            src="/icons/chevron.svg"
                            alt=""
                            aria-hidden="true"
                            width={20}
                            height={20}
                            className={displayComments ? "chevronDown" : "chevronUp"}
                        />
                    </button>
                </span>

                {/* Liste des commentaires */}
                {displayComments && task.comments.map((comment) => (
                    <div key={comment.id} className="commentWrapper" aria-label={`Commentaire de ${comment.author.name}`}>
                        <span className="commentHeader">
                            <p>{comment.author.name}</p>
                            <p aria-label={`Posté le ${convertDate(comment.createdAt)}`}>{convertDate(comment.createdAt)}</p>
                        </span>
                        <p>{comment.content}</p>
                    </div>
                ))}
            </div>
        </article>
    )
}