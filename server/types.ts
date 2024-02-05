export type GoalType = "todo" | "daily";

export type Goal = {
    name: string,
    description: string,
    isComplete: boolean,
    goalType: GoalType,
    moduleId?: number,
    dueDate?: Date | string,
    completionTime?: Date | string,
    expiration?: Date | string
}

export type Profile = {
    id: number,
    username: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
    jobTitle: string,
    bio: string
}
export type CompleteGoal = {
    goal_id: number,
    name: string,
    description: string,
    isComplete: boolean,
    goalType: GoalType,
    moduleId: number,
    dueDate?: Date,
    subGoals: any[]
}
