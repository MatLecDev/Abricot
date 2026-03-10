"use client"

import {ProjectMember, Task} from "@/types";
import {convertDate, convertStatus} from "@/utils/taskUtils";
import {getInitials} from "@/utils/stringUtils";
import Image from "next/image";
import {useState} from "react";
import "@/styles/projectTaskCard.css"

export default function ProjectTaskCard({task, members, onEditAction}: {task: Task, members: ProjectMember[], onEditAction: (task: Task) => void}){
    const [displayComments, setDisplayComments] = useState<boolean>(false);

    const handleDisplayComments = () => {
        setDisplayComments(!displayComments);
    }

    return(
        <article className="projectTask">
            <div className="taskHeader">
                <span className="taskTitle">
                    <h3>{task.title}</h3>
                    <p className={"status " + (task.status)}>{convertStatus(task.status)}</p>
                </span>
                <Image
                    src="/icons/modify.svg"
                    alt="update task icon"
                    width={20}
                    height={5}
                    className="updateIcon"
                    onClick={() => onEditAction(task)}
                />
            </div>
            <p>{task.description}</p>
            <div className="dueDate">
                <h4>Échéance : </h4>
                <span>
                    <Image
                        src="/icons/date-black.svg"
                        alt="Icone calendrier"
                        width={20}
                        height={20}
                    />
                    <p>{convertDate(task.dueDate)}</p>
                </span>
            </div>
            <div className="taskContributors">
                Assigné à :
                {members.map((member: ProjectMember) => {
                    return(
                        <span className="contributor" key={member.id}>
                            <p>{getInitials(member.user.name)}</p>
                            <p>{member.user.name}</p>
                        </span>
                    )
                })}
            </div>
            <div className="projectTasksComments">
                <span className="commentsHeader">
                    <p>Commentaires ({task.comments.length})</p>
                    <button
                        onClick={handleDisplayComments}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                        <Image
                            src="/icons/chevron.svg"
                            alt="icon chevron"
                            width={20}
                            height={20}
                            className={displayComments ? "chevronDown" : "chevronUp"}
                        />
                    </button>
                </span>
                {displayComments && task.comments.map((comment) => {
                    return(
                        <div
                            key={comment.id}
                            className="commentWrapper"
                        >
                            <span className="commentHeader">
                                <p>{comment.author.name}</p>
                                <p>{convertDate(comment.createdAt)}</p>
                            </span>
                            <p>{comment.content}</p>
                        </div>
                    )
                })}
            </div>
        </article>
    )
}