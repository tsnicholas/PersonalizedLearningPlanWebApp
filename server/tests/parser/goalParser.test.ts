export {};

import GoalParser from '../../parser/goalParser';
import { GoalType } from '../../types';

const TEST_DATA = {
    emails: ["testdummy@yahoo.com", "example@outlook.com"],
    password: "01010101010",
    usernames: ["testdummy", "horseEnjoyer4000"],
    goalNames: ["Complete this quiz", "Homework", "sub-goal"],
    goalDescriptions: ["This is a quiz that I need to complete.", "Complete my homework today.", "This is a sub goal"],
    isComplete: false,
    dueDate: `2025-01-01T23:59:59.000Z`,
    upcomingDueDate: new Date((new Date().getTime() / 1000) + (24 * 3600)),
    pastDueDate: "1990-01-23T14:19:19.000Z",
    completionTime: `2024-01-23T14:19:19.000Z`,
    expiration: `2030-01-23T14:15:00.000Z`,
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
            values: [TEST_DATA.emails[0], TEST_DATA.password]
        });
        accountId = await getAccountID(TEST_DATA.emails[0]);
        await client.query({
            text: "INSERT INTO MODULE(account_id) VALUES($1)",
            values: [accountId]
        });
        moduleID = await getModuleID(accountId);
    });

    async function getAccountID(email: string): Promise<number> {
        const queryResult = await client.query({
            text: "SELECT id FROM ACCOUNT WHERE email = $1 AND account_password = $2",
            values: [email, TEST_DATA.password]
        });
        return queryResult.rows[0].id;
    }

    async function getModuleID(id: number): Promise<number> {
        const moduleIDQuery = await client.query(
            "SELECT module_id FROM MODULE WHERE account_id = $1",
            [id]
        );
        return moduleIDQuery.rows[0].module_id;
    }

    afterEach(async () => {
        await client.query(
            "DELETE FROM ACCOUNT WHERE (email = $1 OR email = $3) AND account_password = $2",
            [TEST_DATA.emails[0], TEST_DATA.password, TEST_DATA.emails[1]]
        );
        client.release();
    });

    afterAll(async () => {
        await parser.pool.end();
    });
    
    it('store goal (no due date)', async () => {
        const goalID = await parser.storeGoal({
            name: TEST_DATA.goalNames[0], description: TEST_DATA.goalDescriptions[0], goalType: GoalType.TASK, 
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
                name: TEST_DATA.goalNames[0],
                description: TEST_DATA.goalDescriptions[0],
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
            name: TEST_DATA.goalNames[0], description: TEST_DATA.goalDescriptions[0], goalType: GoalType.REPEATABLE, 
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
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.dueDate]
        );
        const result = await parser.parseParentGoals(moduleID);
        console.log(`Parsed from goals: ${JSON.stringify(result)}`);
        expect(result).toEqual(getExpectedParentGoal({goalType: GoalType.TASK, dueDateExists: true}));
    });

    it('parse goal variable (module_id case)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
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
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoal(goalID, TEST_DATA.goalNames[1], TEST_DATA.goalDescriptions[1], GoalType.TASK, false);
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        var defaultExpected = getExpectedParentGoal({goalType: GoalType.TASK, goalId: goalID});
        expect(actual.rows).toEqual([
            {
                ...defaultExpected[0],
                name: TEST_DATA.goalNames[1],
                description: TEST_DATA.goalDescriptions[1],
            }
        ]);
    });

    it('update goal (with due date)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoal(goalID, TEST_DATA.goalNames[1], TEST_DATA.goalDescriptions[1], GoalType.TASK, 
            false, convertToPostgresTimestamp(TEST_DATA.dueDate));
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        var defaultExpected = getExpectedParentGoal({goalType: GoalType.TASK, goalId: goalID, dueDateExists: true});
        expect(actual.rows).toEqual([
            {
                ...defaultExpected[0],
                name: TEST_DATA.goalNames[1],
                description: TEST_DATA.goalDescriptions[1],
            }
        ]);
    });

    it('update goal timestamps (no expiration)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.updateGoalTimestamps(goalID, convertToPostgresTimestamp(TEST_DATA.completionTime));
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        expect(actual.rows).toEqual(getExpectedParentGoal({goalId: goalID, goalType: GoalType.REPEATABLE, completionTimeExists: true}));
    });

    it('update goal timestamp (with expiration)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID]
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
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        await parser.deleteGoal(goalID);
        var actual = await client.query(selectQuery(goalID, QUERY_VARIABLES.goal));
        expect(actual.rows).toEqual([]);
    });

    it('store sub goal (no due date)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.REPEATABLE, TEST_DATA.isComplete, moduleID]
        );
        var goalID = await getGoalID();
        var subGoalID = await parser.storeSubGoal(goalID, 
            {name: TEST_DATA.goalNames[2], description: TEST_DATA.goalDescriptions[2], goalType: GoalType.TASK, 
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
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, 
            convertToPostgresTimestamp(TEST_DATA.dueDate)]
        );
        var goalID = await getGoalID();
        var subGoalID = await parser.storeSubGoal(goalID, 
            {name: TEST_DATA.goalNames[2], description: TEST_DATA.goalDescriptions[2], goalType: GoalType.TASK, 
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

    it('parse accounts with upcoming due dates (null due date case)', async () => {
        createTestParentGoal();
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([]);
    });

    it('parse accounts with upcoming due dates (emails off case)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.dueDate]
        );
        await client.query({
            text: "UPDATE ACCOUNT SET receives_emails = $1 WHERE id = $2",
            values: [false, accountId]
        });
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([]);
    });

    it('parse accounts with upcoming due dates (correct case)', async () => {
        await client.query(
            "INSERT INTO PROFILE(username, first_name, last_name, account_id) VALUES ($1, $2, $3, $4)",
            [TEST_DATA.usernames[0], 'test', 'dummy', accountId]
        );
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.upcomingDueDate]
        );
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([
            {
                goal: TEST_DATA.goalNames[0],
                username: TEST_DATA.usernames[0],
                email: TEST_DATA.emails[0],
                due_date: TEST_DATA.upcomingDueDate
            }
        ]);
    });

    it('parse accounts with upcoming due dates (is complete case)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, true, moduleID, TEST_DATA.upcomingDueDate]
        );
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([]);
    });

    it('parse accounts with upcoming due dates (past due case)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.pastDueDate]
        );
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([]);
    });

    it('parse accounts with upcoming due dates (distant future case)', async () => {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.expiration]
        );
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([]);
    });

    it('parse accounts with upcoming due dates (two accounts case, both true)', async() => {
        await client.query(
            "INSERT INTO ACCOUNT(email, account_password) VALUES ($1, $2)",
            [TEST_DATA.emails[1], TEST_DATA.password]
        );
        const altAccountId = await getAccountID(TEST_DATA.emails[1]);
        console.log(`Account ids: ${accountId} ${altAccountId}`);
        console.log(`Usernames: ${TEST_DATA.usernames[0]} ${TEST_DATA.usernames[1]}`)
        await client.query({
            text: "INSERT INTO PROFILE(username, first_name, last_name, account_id) VALUES ($1, 'Jim', 'Brown', $2), ($3, 'Chuck', 'Norris', $4)",
            values: [TEST_DATA.usernames[0], accountId, TEST_DATA.usernames[1], altAccountId]
        });
        await client.query(
            "INSERT INTO MODULE(account_id) VALUES ($1)",
            [altAccountId]
        );
        const altModuleId = await getModuleID(altAccountId);
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $3, $4, $9, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.upcomingDueDate, TEST_DATA.goalNames[1], TEST_DATA.goalDescriptions[1], altModuleId]
        );
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([
            {
                goal: TEST_DATA.goalNames[0],
                username: TEST_DATA.usernames[0],
                email: TEST_DATA.emails[0],
                due_date: TEST_DATA.upcomingDueDate,
            },
            {
                goal: TEST_DATA.goalNames[1],
                username: TEST_DATA.usernames[1],
                email: TEST_DATA.emails[1],
                due_date: TEST_DATA.upcomingDueDate,
            }
        ]);
    });

    it('parse accounts with upcoming due dates (two accounts case, 1 true)', async() => {
        await client.query(
            "INSERT INTO ACCOUNT(email, account_password) VALUES ($1, $2)",
            [TEST_DATA.emails[1], TEST_DATA.password]
        );
        const altAccountId = await getAccountID(TEST_DATA.emails[1]);
        console.log(`Account ids: ${accountId} ${altAccountId}`);
        console.log(`Usernames: ${TEST_DATA.usernames[0]} ${TEST_DATA.usernames[1]}`)
        await client.query({
            text: "INSERT INTO PROFILE(username, first_name, last_name, account_id) VALUES ($1, 'Jim', 'Brown', $2), ($3, 'Chuck', 'Norris', $4)",
            values: [TEST_DATA.usernames[0], accountId, TEST_DATA.usernames[1], altAccountId]
        });
        await client.query(
            "INSERT INTO MODULE(account_id) VALUES ($1)",
            [altAccountId]
        );
        const altModuleId = await getModuleID(altAccountId);
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id, due_date) VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $3, $4, $9, $6)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID, TEST_DATA.upcomingDueDate, TEST_DATA.goalNames[1], TEST_DATA.goalDescriptions[1], altModuleId]
        );
        await client.query(
            "UPDATE ACCOUNT SET receives_emails = $1 WHERE id = $2",
            [false, accountId]
        );
        const result = await parser.parseAccountsWithUpcomingDueDates();
        expect(result).toEqual([
            {
                goal: TEST_DATA.goalNames[1],
                username: TEST_DATA.usernames[1],
                email: TEST_DATA.emails[1],
                due_date: TEST_DATA.upcomingDueDate,
            }
        ]);
    });

    async function createTestParentGoal() {
        await client.query(
            "INSERT INTO GOAL(name, description, goal_type, is_complete, module_id) VALUES ($1, $2, $3, $4, $5)",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0], GoalType.TASK, TEST_DATA.isComplete, moduleID]
        );
    }
    
    function getExceptedSubGoals(subGoalProps: ExpectedSubGoalResultProps) {
        return [
            {
                goal_id: expect.any(Number),
                name: TEST_DATA.goalNames[2],
                description: TEST_DATA.goalDescriptions[2],
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
                name: TEST_DATA.goalNames[1],
                description: TEST_DATA.goalDescriptions[1],
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
            [moduleID, goalID, TEST_DATA.goalNames[2], TEST_DATA.goalDescriptions[2], GoalType.REPEATABLE, TEST_DATA.isComplete, TEST_DATA.goalNames[1], TEST_DATA.goalDescriptions[1]]
        );
    }

    async function getGoalID() {
        const goalIDQuery = await client.query(
            "SELECT goal_id FROM GOAL WHERE name = $1 AND description = $2",
            [TEST_DATA.goalNames[0], TEST_DATA.goalDescriptions[0]]
        );
        return goalIDQuery.rows[0].goal_id;
    }
});
