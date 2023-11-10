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
        console.log("Login stored!");
    }
    
    async retrieveLogin(username, password) {
        console.log("Retrieving login...");
        // TODO: "TypeError: CloudflareSocket is not a constructor"
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

    async getProfile(id){
        console.log("Getting profile...");
        const client = await this.pool.connect();
        const query = {
            text: "SELECT * FROM PROFILE WHERE account_id = $1",
            values: [id]
        };
        await client.query(query);
        const result = await client.query(`SELECT * FROM PROFILE WHERE account_id = ${id}`);
        client.release();
        console.log("Found profile!");
        return result.rows;
    }

    async createProfile(firstName, lastName, account_id) {
        console.log("Creating profile...");
        const client = await this.pool.connect();
        const query = {
            text: "INSERT INTO PROFILE(firstName, lastName, account_id) VALUES($1, $2, $3)",
            values: [firstName, lastName, account_id]
        };
        await client.query(query);
        client.release();
        console.log("Profile created!");
    }

    async insertProfileData(firstName, lastName, profilePicture, jobTitle, bio, account_id) {
        console.log("Inserting new data into profile...");
        const client = await this.pool.connect();
        const query = {
            text: "INSERT INTO PROFILE(firstName, lastName, profilePicture, jobTitle, bio) VALUES($1, $2, $3, $4, $5) WHERE account_id = $6",
            values: [firstName, lastName, profilePicture, jobTitle, bio, account_id]
        };
        await client.query(query);
        client.release();
        console.log("Profile data saved!");
    }
}

module.exports = DatabaseParser;