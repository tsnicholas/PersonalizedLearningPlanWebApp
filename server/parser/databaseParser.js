const pg = require("pg");
const path = require("path");
require('dotenv').config({
    path: path.join(__dirname, ".env")
});

class DatabaseParser {
    constructor() {
        console.log("Constructing...");
        this.pool = new pg.Pool({
            host: 'localhost',
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            port: process.env.POSTGRES_PORT
        });
        this.pool.on("error", (error) => {
            console.error("An error has occurred while parsing data.", error);
        });
        console.log("Constructing complete!");
    }

    async storeLogin(username, email, password) {
        console.log("Storing login...");
        const query = {
            text: "INSERT INTO ACCOUNT(username, account_password, email) VALUES($1, $2, $3)",
            values: [username, password, email]
        };
        const client = await this.pool.connect();
        await client.query(query);
        client.release();
        console.log("Login Stored!");
    }
    
    async retrieveLogin(username, password) {
        console.log("Retrieving login...");
        const client = await this.pool.connect();
        const query = {
            text: "SELECT * FROM ACCOUNT WHERE username = $1 AND account_password = $2",
            values: [username, password]
        };
        const result = await client.query(query);
        client.release();
        console.log("Login found!");
        return result.rows;
    }

    async parseProfile(email) {
        console.log("Getting profile...");
        const client = await this.pool.connect();
        const query = {
            text: "SELECT * FROM PROFILE WHERE email = $1",
            values: [email]
        };
        const result = await client.query(query);
        client.release();
        console.log("Found profile!");
        return result.rows;
    }

    async storeProfile(firstName, lastName, email) {
        console.log("Creating profile...");
        const client = await this.pool.connect();
        const query = {
            text: "INSERT INTO PROFILE(firstName, lastName, email) VALUES($1, $2, $3)",
            values: [firstName, lastName, email]
        };
        await client.query(query);
        client.release();
        console.log("Profile Created!");
    }

    async updateProfileData(firstName, lastName, profilePicture, jobTitle, bio, email) {
        console.log("Inserting new data into profile...");
        const client = await this.pool.connect();
        const query = {
            text: "UPDATE PROFILE SET firstName = $1, lastName = $2, profilePicture = $3, jobTitle = $4, bio = $5 WHERE email = $6",
            values: [firstName, lastName, profilePicture, jobTitle, bio, email]
        };
        await client.query(query);
        client.release();
        console.log("Profile data saved!");
    }

    async storeModule(name, completion_percent, sub_goals, email) {
        console.log("Storing Module...");
        const query = {
            text: "INSERT INTO Module(module_name, completion_percent, sub_goals, email) VALUES($1, $2, $3, $4)",
            values: [name, completion_percent, sub_goals, email]
        };
        const client = await this.pool.connect();
        await client.query(query);
        client.release();
        console.log("Module Stored!");
    }
    async parseModule(email) {
        console.log("Getting Module...");
        const client = await this.pool.connect();
        const query = {
            text: "SELECT * FROM Module WHERE email = $1",
            values: [email]
        };
        const result = await client.query(query);
        client.release();
        console.log("Found Module!");
        return result.rows;
    }
    async updateModule(name, completion_percent, sub_goals, email, module_id) {
        console.log("Inserting new data into Module...");
        const client = await this.pool.connect();
        const query = {
            text: "UPDATE Module SET module_name = $1, completion_percent = $2, sub_goals = $3, email = $4 WHERE module_id = $5",
            values: [name, completion_percent, sub_goals, email, module_id]
        };
        await client.query(query);
        client.release();
        console.log("Module data saved!");
    }
}

module.exports = DatabaseParser;
