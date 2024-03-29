export enum StatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    CONNECTION_ERROR = 404,
    CONFLICT = 409,
    GONE = 410,
    INTERNAL_SERVER_ERROR = 500
}

export enum GoalType {
    TASK = "todo",
    REPEATABLE = "daily"
}

export enum Subject {
    INVITATION = "Coach Invitation",
    ACCEPTED = "Invitation Accepted!",
    REJECTED = "Invitation Rejected!"
}

export type Goal = {
    goal_id?: number,
    name: string,
    description: string,
    is_complete: boolean,
    goal_type: GoalType,
    module_id?: number,
    tag_id?: number,
    due_date?: string,
    completion_time?: string,
    expiration?: string,
    feedback?: string,
    subGoals?: Goal[]
}

export type Profile = {
    id?: number,
    username: string,
    firstName: string,
    lastName: string,
    accountId?: number,
    profilePicture?: string,
    jobTitle?: string,
    bio?: string
}

export type Module = {
    id?: number,
    name: string,
    description: string,
    completion: number
    accountId?: number
    coachId?: number
}

export type AccountSettings = {
    id?: number,
    receiveEmails: boolean,
    allowCoachInvitations: boolean,
    accountId?: number
}

export type InviteData = {
    id: number,
    recipient_id: number,
    recipient_email: string,
    recipient_username: string,
    sender_id: number,
    sender_email: string,
    sender_username: string
}

export interface Query {
    text: string,
    values: (string | number | boolean | Date | undefined)[]
}
