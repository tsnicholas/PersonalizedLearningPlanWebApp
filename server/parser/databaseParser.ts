import pg from "pg";
import path from "path";
require('dotenv').config({
    path: path.join(__dirname, ".env")
});

export default class DatabaseParser {
    pool;

    constructor() {
        console.log("Constructing...");
        this.pool = new pg.Pool({
            host: process.env.POSTGRES_HOST || 'db',
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 0
        });
        console.log("Constructing complete!");
    }
}