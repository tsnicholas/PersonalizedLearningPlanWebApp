const STATUS_CODES = require("../utils/statusCodes");

class StatusCodes {
    getStatusCode(error) {
        switch (error.code) {
            case '23505':
                console.log("Duplicate data.");
                return STATUS_CODES.CONFLICT;
            case '08000': case '08003': case '08007':
                console.log("Connection error");
                return STATUS_CODES.CONNECTION_ERROR;
            case '23514':
                console.log("Bad data.");
                return STATUS_CODES.BAD_REQUEST;
            default:
                console.error("Fatal server error.", error);
                return STATUS_CODES.INTERNAL_SERVER_ERROR;
        }
    }
}

module.exports = StatusCodes;