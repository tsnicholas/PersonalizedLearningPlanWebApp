export {};

import GoalParser from '../../parser/goalParser';
import { GoalType } from '../../types';

const TEST_DATA = {
    email: "testdummy@yahoo.com",
    password: "01010101010",
    goalName: "Complete this quiz",
    goalDescription: "This is a quiz that I need to complete.",
    isComplete: false,
    dueDate: `2025-01-01T23:59:59.000Z`,
    completionTime: `2024-01-23T14:19:19.000Z`,
    expiration: `2030-01-23T14:15:00.000Z`,
    subGoalName: "sub-goal",
    subGoalDescription: "This is a sub goal",
    altGoalName: "Homework",
    altGoalDescription: "Complete my homework today."
}

interface ExpectedParentGoalResultProps {
    goalType: GoalType, 
    goalId?: number, 
    dueDateExists?: boolean, 
    completionTimeExists?: boolean, 
    expirationExists?: boolean
}

interface ExpectedSubGoalResultProps {
    parentGoalId: number,
    goalType: GoalType,
    dueDateExists?: boolean, 
    completionTimeExists?: boolean, 
    expirationExists?: boolean
}

function convertToPostgresTimestamp(input: string): string {
    return input.replace('T', ' ').replace('Z', '');
}

const QUERY_VARIABLES = {
    module: "module_id",
    goal: "goal_id",
    parent: "parent_goal"
}

function selectQuery(id: number, variable: string) {
    const utcToEstConversionQuery = "AT TIME ZONE 'UTC' AT TIME ZONE 'EST'";
    const dueDateString = `due_date::timestamp ${utcToEstConversionQuery} AS due_date`;
    const completionTimeString = `completion_time::timestamp ${utcToEstConversionQuery} AS completion_time`;
    const expirationString = `expiration::timestamp ${utcToEstConversionQuery} AS expiration`;
    
    return {
        text: `SELECT goal_id, name, description, goal_type, is_complete, module_id, ${dueDateString}, ${completionTimeString}, ${expirationString}, parent_goal FROM GOAL WHERE ${variable} = $1`,
        values: [id]
    }
}

describe('goal parser tests', () => {
    var parser = new GoalParser();
    var client : any;
    var accountId : number;
    var moduleID : number;
    
    beforeEach(async () => {
        client = await parser.pool.connect();
        await client.query({
            text: "INSERT INTO ACCOUNT(email, account_password) VALUES($1, $2)",
            values: [TEST_DATA.email, TEST_DATA.password]
        });
        accountId = await getAccountID();
        await client.query({
            text: "INSERT INTO MODULE(account_id) VALUES($1)",
            values: [accountId]
        });
        moduleID = await getModuleID();
    });

    async function getAccountID(): Promise<number> {
        const queryResult = await client.query({
            text: "SELECT id FROM ACCOUNT WHERE email = $1 AND account_password = $2",
            values: [TEST_DATA.email, TEST_DATA.password]
        });
        return queryResult.rows[0].id;
    }

    async function getModuleID() {
        const moduleIDQuery = await client.query(
            "SELECT module_id FROM MODULE WHERE account_id = $1",
            [accountId]
        );
        return moduleIDQuery.rows[0].module_id;
    }

    afterEach(async () => {
        await client.query(
            "DELETE FROM ACCOUNT WHERE email = $1 AND account_password = $2",
            [TEST_DATA.email, TEST_DATA.password]
        );
        client.release();
    });

    afterAll(async () => {
        await parser.pool.end();
    });
    
    it('store goal (no due date)', async () => {
        const goalID = await parser.storeGoal({
            name: TEST_DATA.goalName, description: TEST_DATA.goalDescription, goalType: GoalType.TASK, 
            isComplete: TEST_DATA.isComplete, moduleId: moduleID
        });
        expect(goalID).toEqual([
            {
                goal_id: expect.any(Number)
            }
        ]);
        var actual = await client.query(selectQuery(moduleID, QUERY_VARIABLES.module));
        expect(actual.rows).toEqual(getExpectedParentGoal({goalType: GoalType.TASK}));
    });

    function getExpectedParentGoal(resultProps: ExpectedParentGoalResultProps): any[] {
        return [
            {
                goal_id: resultProps.goalId ? resultProps.goalId : expect.any(Number),
                name: TEST_DATA.goalName,
                description: TEST_DATA.goalDescription,
                goal_type: resultProps.goalType,
                is_complete: TEST_DATA.isComplete,
                due_date: resultProps.dueDateExists ? new Date(TEST_DATA.dueDate) : null,
                module_id: moduleID,
                completion_time: resultProps.completionTimeExists ? new Date(TEST_DATA.completionTime) : null,
                expiration: resultProps.expirationExists ? new Date(TEST_DATA.expiration) : null,
                parent_goal: null
            }
        ]
    }

    it('store goal (with due date)', async () => {
        const goalID = await parser.storeGoal({
            name: TEST_DATA.goalName, description: TEST_DATA.goalDescription, goalType: GoalType.REPEATABLE, 
            isComplete: TEST_DATA.isComplete, moduleId: moduleID, dueDate: convertToPostgresTimestamp(TEST_DATA.dueDate)});
        expect(goalID).toEqual([
            {
                goal_id: expect.any(Number)
            }
        ]);
        var actual = await client.query(selectQuery(moduleID, QUERY_VARIABLES.module));
        expect(actual.rows).toEqual(getExpectedParentGoal({goalType: GoalType.REPEATABLE, dueDateExists: true}));
    });

    it('parse parent goals', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.dueDate]
        );
        const result = await parser.parseParentGoals(moduleID);
        console.log(`Parsed from goals: ${JSON.stringify(result)}`);
        expect(result).toEqual(getExpectedParentGoal({goalType: GoalType.TASK, dueDateExists: true}));
    });

    it('parse goal variable (module_id case)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        var result = await parser.parseGoalVariable(goalID, "module_id");
        expect(result).toEqual([
            {
                module_id: moduleID
            }
        ]);
    });

    it('update goal (no due date)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoal(goalID, TEST_DATA.altGoalName, TEST_DATA.altGoalDescription, GoalType.TASK, false);
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        var defaultExpected = getExpectedParentGoal({goalType: GoalType.TASK, goalId: goalID});
        expect(actual.rows).toEqual([
            {
                ...defaultExpected[0],
                name: TEST_DATA.altGoalName,
                description: TEST_DATA.altGoalDescription,
            }
        ]);
    });

    it('update goal (with due date)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoal(goalID, TEST_DATA.altGoalName, TEST_DATA.altGoalDescription, GoalType.TASK, 
            false, convertToPostgresTimestamp(TEST_DATA.dueDate));
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        var defaultExpected = getExpectedParentGoal({goalType: GoalType.TASK, goalId: goalID, dueDateExists: true});
        expect(actual.rows).toEqual([
            {
                ...defaultExpected[0],
                name: TEST_DATA.altGoalName,
                description: TEST_DATA.altGoalDescription,
            }
        ]);
    });

    it('update goal timestamps (no expiration)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoalTimestamps(goalID, convertToPostgresTimestamp(TEST_DATA.completionTime));
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        expect(actual.rows).toEqual(getExpectedParentGoal({goalId: goalID, goalType: GoalType.REPEATABLE, completionTimeExists: true}));
    });

    it('update goal timestamp (with expiration)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoalTimestamps(goalID, 
            convertToPostgresTimestamp(TEST_DATA.completionTime), 
            convertToPostgresTimestamp(TEST_DATA.expiration));
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        expect(actual.rows).toEqual(getExpectedParentGoal({
            goalId: goalID, goalType: GoalType.TASK, completionTimeExists: true, expirationExists: true}));
    });

    it('delete goal', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.deleteGoal(goalID);
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        expect(actual.rows).toEqual([]);
    });

    it('store sub goal (no due date)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        var subGoalID = await parser.storeSubGoal(goalID, 
            {name: TEST_DATA.subGoalName, description: TEST_DATA.subGoalDescription, goalType: GoalType.TASK, 
                isComplete: false, moduleId: moduleID});
        expect(subGoalID).toEqual([
            {
                goal_id: expect.any(Number)
            }
        ]);
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.parent));
        expect(actual.rows).toEqual([
            getExceptedSubGoals({parentGoalId: goalID, goalType: GoalType.TASK})[0]
        ]);
    });

    it('store sub goal (with due date)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.TASK, TEST_DATA.isComplete, moduleID, 
            convertToPostgresTimestamp(TEST_DATA.dueDate)]
        );
        var goalID = await getGoalID();
        var subGoalID = await parser.storeSubGoal(goalID, 
            {name: TEST_DATA.subGoalName, description: TEST_DATA.subGoalDescription, goalType: GoalType.TASK, 
                isComplete: false, moduleId: moduleID, dueDate: convertToPostgresTimestamp(TEST_DATA.dueDate)});
        expect(subGoalID).toEqual([
            {
                goal_id: expect.any(Number)
            }
        ]);
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.parent));
        expect(actual.rows).toEqual([
            getExceptedSubGoals({parentGoalId: goalID, goalType: GoalType.TASK, dueDateExists: true})[0]
        ]);
    });

    it('parse sub goals', async () => {
        createTestParentGoal();
        var goalID = await getGoalID();
        createTestSubGoals(goalID);
        const result = await parser.parseSubGoals(goalID);
        expect(result).toEqual(getExceptedSubGoals({goalType: GoalType.REPEATABLE, parentGoalId: goalID}));
    });

    it('parse accounts with upcoming due dates (null case)', async () => {
        createTestParentGoal();
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([]);
    });

    async function createTestParentGoal() {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalName, TEST_DATA.goalDescription, GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
    }
    
    function getExceptedSubGoals(subGoalProps: ExpectedSubGoalResultProps) {
        return [
            {
                goal_id: expect.any(Number),
                name: TEST_DATA.subGoalName,
                description: TEST_DATA.subGoalDescription,
                goal_type: subGoalProps.goalType,
                is_complete: TEST_DATA.isComplete,
                module_id: moduleID,
                due_date: subGoalProps.dueDateExists ? new Date(TEST_DATA.dueDate) : null,
                completion_time: subGoalProps.completionTimeExists ? new Date(TEST_DATA.completionTime) : null,
                expiration: subGoalProps.expirationExists ? new Date(TEST_DATA.expiration) : null,
                parent_goal: subGoalProps.parentGoalId
            },
            {
                goal_id: expect.any(Number),
                name: TEST_DATA.altGoalName,
                description: TEST_DATA.altGoalDescription,
                goal_type: subGoalProps.goalType,
                is_complete: TEST_DATA.isComplete,
                module_id: moduleID,
                due_date: subGoalProps.dueDateExists ? new Date(TEST_DATA.dueDate) : null,
                completion_time: subGoalProps.completionTimeExists ? new Date(TEST_DATA.completionTime) : null,
                expiration: subGoalProps.expirationExists ? new Date(TEST_DATA.expiration) : null,
                parent_goal: subGoalProps.parentGoalId
            }
        ]
    }

    async function createTestSubGoals(goalID : number) {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, parent_goal) VALUES ($3, $4, $5, $6, $1, $2), ($7, $8, $5, $6, $1, $2)",
            [moduleID, goalID, TEST_DATA.subGoalName, TEST_DATA.subGoalDescription, GoalType.REPEATABLE, TEST_DATA.isComplete, TEST_DATA.altGoalName, TEST_DATA.altGoalDescription]
        );
    }

    async function getGoalID() {
        const goalIDQuery = await client.query(
            "SELECT goal_id FROM GOAL WHERE name = $1 AND description = $2",
            [TEST_DATA.goalName, TEST_DATA.goalDescription]
        );
        return goalIDQuery.rows[0].goal_id;
    }
});
