const express = require("express");
const router = express.Router();
const authenticateToken = require("../utils/authenticateToken");
const initializeErrorMessages = require("../utils/errorMessages");
const ProfileAPI = require("../controller/profileProcessor");
const STATUS_CODES = require("../utils/statusCodes");

const ERROR_MESSAGES = initializeErrorMessages();
const profileAPI = new ProfileAPI();

router.get('/get/:id', authenticateToken, async(req, res) => {
    console.log(`Data Received in get profile: ${req.params.id}`);
    const profileQuery = await profileAPI.getProfile(req.params.id);
    if(typeof profileQuery !== "object") {
        console.error("There was a problem retrieving profile.");
        console.log(profileQuery);
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.status(STATUS_CODES.OK).json(profileQuery);
});

module.exports = router;
