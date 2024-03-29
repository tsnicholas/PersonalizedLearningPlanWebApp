import ProfileAPI from "../api/profileApi";
import { StatusCode } from "../../types";
import { initializeErrorMap } from "../../utils/errorMessages";
import { Request, Response } from "express";

const profileAPI = new ProfileAPI();
const ERROR_MESSAGES = initializeErrorMap();

async function getAllProfiles(req: Request, res: Response) {
    console.log("Get all profiles has been called!");
    const profileQuery = await profileAPI.getAllProfiles();
    if(profileQuery as StatusCode in StatusCode) {
        console.error("There was a problem retrieving profile.");
        res.status(profileQuery as StatusCode).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.status(StatusCode.OK).json(profileQuery);
}

async function sendProfile(req : Request, res : Response) {
    console.log(`Data received in get profile: ${req.params.id}`);
    const profileQuery = await profileAPI.getProfile(Number(req.params.id));
    if(profileQuery as StatusCode in StatusCode) {
        console.error("There was a problem retrieving profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.status(StatusCode.OK).json(profileQuery);
}

async function postProfile(req : Request, res : Response) {
    console.log(`Data received in create profile: ${req.body.account_id}`);
    const profileQuery = await profileAPI.createProfile(req.body.username, req.body.firstName, req.body.lastName, req.body.account_id);
    if(profileQuery !== StatusCode.OK) {
        console.error("There was a problem creating profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.sendStatus(StatusCode.OK);
}

async function putProfile(req : Request, res : Response) {
    console.log(`Data received in update profile: ${req.params.id}`);
    const profileQuery = await profileAPI.updateProfile({
        id: parseInt(req.params.id), 
        username: req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        profilePicture: req.body.profilePicture, 
        jobTitle: req.body.jobTitle, 
        bio: req.body.bio
    });
    if(profileQuery !== StatusCode.OK) {
        console.error("There was a problem updating profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.sendStatus(StatusCode.OK);
}

async function deleteProfile(req : Request, res : Response) {
    console.log(`Data received in delete profile: ${req.params.id}`);
    const profileQuery = await profileAPI.deleteProfile(parseInt(req.params.id));
    if(profileQuery !== StatusCode.OK) {
        console.error("There was a problem deleting profile.");
        res.status(profileQuery).send(ERROR_MESSAGES.get(profileQuery));
        return;
    }
    res.sendStatus(StatusCode.OK);
}

export { getAllProfiles, sendProfile, postProfile, putProfile, deleteProfile };
