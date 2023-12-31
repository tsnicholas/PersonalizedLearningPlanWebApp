const express = require("express");
const router = express.Router();
const authenticateToken = require("../utils/authenticateToken");
const initializeErrorMessages = require("../utils/errorMessages");
const ProfileAPI = require("../controller/profileProcessor");
const STATUS_CODES = require("../utils/statusCodes");

const ERROR_MESSAGES = initializeErrorMessages();
const profileAPI = new ProfileAPI();

router.get('/get/:id', authenticateToken, async(req, res) => {
    console.log(`Data received in get profile: ${req.params.id}`);
    const profileQuery = await profileAPI.getProfile(req.params.id);
    if(typeof profileQuery !== "object") {
        console.error("There was a problem retrieving profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.status(STATUS_CODES.OK).json(profileQuery);
});

router.post('/create', async(req, res) => {
    console.log(`Data received in create profile: ${req.body.email}`);
    const profileQuery = await profileAPI.createProfile(req.body.username, req.body.firstName, req.body.lastName, req.body.email);
    if(typeof profileQuery !== "object") {
        console.error("There was a problem creating profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.sendStatus(STATUS_CODES.OK);
});

router.put('/edit/:id', authenticateToken, async(req, res) => {
    console.log(`Data received in update profile: ${req.params.id}`);
    const profileQuery = await profileAPI.updateProfile(
        req.params.id, req.body.username, req.body.firstName, req.body.lastName, req.body.profilePicture, 
        req.body.jobTitle, req.body.bio
    );
    if(profileQuery !== STATUS_CODES.OK) {
        console.error("There was a problem updating profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.sendStatus(STATUS_CODES.OK);
});

router.delete('/delete/:id', authenticateToken, async(req, res) => {
    console.log(`Data received in delete profile: ${req.params.id}`);
    const profileQuery = await profileAPI.deleteProfile(req.params.id);
    if(typeof profileQuery !== "object") {
        console.error("There was a problem deleting profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.sendStatus(STATUS_CODES.OK);
});

module.exports = router;
