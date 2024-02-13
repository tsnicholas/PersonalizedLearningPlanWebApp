import GoalParser from "../parser/goalParser";
import { StatusCode } from "../types";
import { ErrorCodeInterpreter } from "./errorCodeInterpreter";
import { Goal } from "../types";

export class GoalAPI {
    parser: GoalParser;
    errorCodeInterpreter: ErrorCodeInterpreter;

    constructor() {
        this.parser = new GoalParser();
        this.errorCodeInterpreter = new ErrorCodeInterpreter();
    }

    async getGoals(moduleId: number) {
        try {
            const parentgoals = await this.parser.parseParentGoals(moduleId);
            for (const goal of parentgoals) {
                const subgoals : Goal[] = await this.getSubGoals(goal.goal_id);
                if (subgoals?.length !== undefined && subgoals?.length !== 0) {
                    goal.sub_goals = subgoals;
                } else {
                    goal.sub_goals = [];
                }
            }
            console.log(parentgoals);
            return parentgoals;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }

    async getSubGoals(goalID: number) {
        try {
            const subGoals = await this.parser.parseSubGoals(goalID);
            return subGoals;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }

    async createGoal(goal: Goal) {
        const dueDate : string | undefined = this.#convertToPostgresTimestamp(goal.dueDate);

        try {
            const results = await this.parser.storeGoal({
                ...goal,
                dueDate: dueDate
            });
            return results;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }

    #convertToPostgresTimestamp(time : string | undefined): string | undefined {
        return time?.replace('T', ' ').replace('Z', ' ');
    }

    async updateGoal(goalId: number, goal : Goal) {
        const dueDate : string | undefined = this.#convertToPostgresTimestamp(goal.dueDate);
        const completionTime : string | undefined = this.#convertToPostgresTimestamp(goal.completionTime);
        const expiration : string | undefined = this.#convertToPostgresTimestamp(goal.expiration);

        try {
            await this.parser.updateGoal(goalId, goal.name, goal.description, goal.goalType, goal.isComplete, dueDate);
            if (completionTime) {
                await this.parser.updateGoalTimestamps(goalId, completionTime, expiration);
            }
            return StatusCode.OK;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }

    async deleteGoal(goalId: number) {
        try {
            await this.parser.deleteGoal(goalId);
            return StatusCode.OK;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }

    async getGoalVariable(goalId: number, variable: string) {
        try {
            const result = await this.parser.parseGoalVariable(goalId, variable);
            return result;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }

    async addSubGoal(parent_goal_id: number, goal: Goal) {
        try {
            console.log(`In addSubGoal: ${JSON.stringify(goal)}`);
            const result = await this.parser.storeSubGoal(parent_goal_id, goal);
            return result;
        } catch (error) {
            return this.errorCodeInterpreter.getStatusCode(error);
        }
    }
}
