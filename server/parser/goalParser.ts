export {};

const DatabaseParser = require("./databaseParser");

class GoalParser extends DatabaseParser {
    constructor() {
        super();
    }

    async parseGoals(module_id : number) {
        console.log("Getting Goals...");
        const query = {
            text: "SELECT * FROM get_goals($1)",
            values: [module_id]
        };
        return this.parseDatabase(query);
    }

    async storeGoal(name : string, description : string, goalType: string, isComplete : boolean, moduleID : number, due_date? : string) {
        console.log("Storing Goal...");
        const query = {
            text: `INSERT INTO GOAL(name, description, goal_type, is_complete, module_id${due_date ? ", due_date" : ""}) VALUES($1, $2, $3, $4, $5${due_date ? ", $6" : ""})`,
            values: due_date ? [name, description, goalType, isComplete, moduleID, due_date] : [name, description, goalType, isComplete, moduleID]
        };
        await this.updateDatabase(query);
        console.log("Goal Stored! Now returning id...");
        const idQuery = {
            text: "SELECT goal_id FROM GOAL WHERE name = $1 AND description = $2 AND module_id = $3",
            values: [name, description, moduleID]
        }
        return this.parseDatabase(idQuery);
    }

    async updateGoal(goalID : number, name : string, description : string, isComplete : boolean, dueDate? : Date) {
        console.log("Inserting updated data into Goal...");
        const query = {
            text: `UPDATE GOAL SET name = $1, description = $2, is_complete = $3${dueDate ? ", due_date = $5" : ""} WHERE goal_id = $4`,
            values: dueDate ? [name, description, isComplete, goalID, dueDate] : [name, description, isComplete, goalID]
        };
        await this.updateDatabase(query);
        console.log("Goal data updated!");
    }

    async updateGoalTimestamps(goalID : number, completionTime : string, expiration? : string) {
        console.log("Inserting timestamp values into Goal...");
        const queryString = `UPDATE GOAL SET completion_time = $1${expiration ? ", expiration = $2" : ""} WHERE goal_id = ${expiration ? "$3" : "$2"}`;
        const query = {
            text: queryString,
            values: expiration ? [completionTime, expiration, goalID] : [completionTime, goalID]
        };
        await this.updateDatabase(query);
        console.log("Timestamps updated!");
    }

    async deleteGoal(goalID : number) {
        console.log("Deleting Goal...");
        const query = {
            text: "DELETE FROM Goal WHERE goal_id = $1",
            values: [goalID]
        };
        await this.updateDatabase(query);
        console.log("Goal successfully deleted!");
    }

    async getModuleID(goalID : number) {
        console.log("Getting goal...");
        const query = {
            text: "SELECT module_id FROM get_goal($1)",
            values: [goalID]
        };
        return this.parseDatabase(query);
    }

    async storeSubGoal(parentGoalID : number, name: string, description : string, goalType : string, isComplete : boolean, moduleID : number, due_date? : Date) {
        console.log("Storing sub goal...");
        const text = `INSERT INTO goal(name, description, goal_type, is_complete, module_id, parent_goal${due_date ? ", due_date" : ""}) VALUES ($1, $2, $3, $4, $5, $6${due_date ? ", $7" : ""})`;
        const query = {
            text: text,
            values: due_date ? [name, description, goalType, isComplete, moduleID, parentGoalID, due_date] : [name, description, goalType, isComplete, moduleID, parentGoalID]
        };
        await this.updateDatabase(query);
        console.log("Sub goal stored! Now returning id...");
        const idQuery = {
            text: "SELECT goal_id FROM GOAL WHERE name = $1 AND description = $2 AND parent_goal = $3",
            values: [name, description, parentGoalID]
        }
        return this.parseDatabase(idQuery);
    }

    async parseSubGoals(goalID : number) {
        console.log("Getting sub goals...");
        const query = {
            text: "SELECT * FROM GOAL WHERE parent_goal = $1",
            values: [goalID]
        };
        return this.parseDatabase(query);
    }
}

module.exports = GoalParser;
