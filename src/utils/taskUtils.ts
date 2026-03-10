export function convertStatus(status: string){
    switch(status){
        case 'TODO':
            return 'A faire'
            break;
        case 'IN_PROGRESS':
            return 'En cours'
            break;
        case 'DONE':
            return 'Terminée'
            break;
        case 'CANCELLED':
            return 'Annulée'
            break;
        default:
            return ''
            break;
    }
}

export function convertDate(date: string){
    return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })
}

export function toInputDate(date: string): string {
    return new Date(date).toISOString().split("T")[0]
}