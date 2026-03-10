import type {Project, User} from "@/types";
import {convertUserRole, getProgression, getTasksDone} from "@/utils/projectUtils";
import {getInitials} from "@/utils/stringUtils";
import "@/styles/projectCard.css"
import Image from "next/image";

export default function ProjectCard({project, user, setActiveProject}: {project: Project, user: User, setActiveProject: (project: Project) => void}){
    const tasksDone = getTasksDone(project)
    const progression = getProgression(tasksDone, project._count.tasks)

    return (
        <article className="project" onClick={() => setActiveProject(project)}>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className="projectProgression">
                <span className="projectProgressionHeader">
                    <h3>Progression</h3>
                    <p className="progressionPourcentage">{progression}%</p>
                </span>
                <span
                    className="projectProgressionBar"
                    style={{ background: `linear-gradient(to right, var(--main-orange) ${progression}%, var(--light-gray) ${progression}%)` }}
                />
                <span>{tasksDone}/{project._count.tasks} tâches terminées</span>
            </div>
            <div className="projectTeam">
                <h3>
                    <Image
                        src="/icons/team.svg"
                        alt="Team icon"
                        width={15}
                        height={15}
                    />
                    Équipe ({project.members.length})
                </h3>
                <span className="projectMembers">
                    <p>{getInitials(user.name)}</p>
                    <p className="role">{convertUserRole(project.userRole)}</p>
                    <div className="contributor">
                        {project.members.map((member) => {
                            if (member.user.id !== user.id){
                                return(
                                    <p key={member.id}>{getInitials(member.user.name)}</p>
                                )
                            }
                            else{
                                return null
                            }
                        })}
                    </div>
                </span>
            </div>
        </article>
    )
}