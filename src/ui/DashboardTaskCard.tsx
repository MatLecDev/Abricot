import {Task} from "@/types";
import {type JSX} from "react";
import {convertStatus, convertDate} from "@/utils/taskUtils";
import Image from "next/image";
import "@/styles/dashboardTaskCard.css"
import Link from "next/link";
import {toSlug} from "@/utils/stringUtils";

export default function DashboardTaskCard({task}: {task: Task}): JSX.Element{

    return (
        <article className="dashboardTask">
            <div className="taskHeader">
                <h3>{task.title}</h3>
                <span className={"status " + (task.status)}>{convertStatus(task.status)}</span>
            </div>
            <p>{task.description}</p>
            <div className="taskContent">
                <div className="taskContentInfos">
                    <span>
                        <Image
                            src="/icons/projects-gray.svg"
                            alt="Icon project"
                            width={15}
                            height={15}
                        />
                        <p>{task.project.name.replace("-", "")}</p>
                    </span>
                    <span>
                        <Image
                            src="/icons/date-gray.svg"
                            alt="Icon project"
                            width={15}
                            height={15}
                        />
                        <p>{convertDate(task.dueDate)}</p>
                    </span>
                    <span>
                        <Image
                            src="/icons/comments-gray.svg"
                            alt="Icon project"
                            width={15}
                            height={15}
                        />
                        <p>{task.comments.length}</p>
                    </span>
                </div>
                <Link href={"/projects/" + toSlug(task.project.name, task.projectId)}>
                    <button className="seeTaskBtn">Voir</button>
                </Link>
            </div>
        </article>
    )
}