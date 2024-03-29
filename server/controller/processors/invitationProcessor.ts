import InvitationApi from "../api/invitationApi";
import EmailService from "../../service/emailService";
import { InviteData, StatusCode, Subject } from "../../types";
import { initializeErrorMap } from "../../utils/errorMessages";
import { Request, Response } from "express";

const ERROR_MESSAGES = initializeErrorMap();
const invitationApi = new InvitationApi();
const emailService = new EmailService();

async function getInvites(req: Request, res: Response) {
    console.log(`Received in get invites: ${req.params.id}`);
    const query = await invitationApi.getInvites(Number(req.params.id));
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to get invites for user ${req.params.id}`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.status(StatusCode.OK).json(query);
}

async function getPendingInvites(req: Request, res: Response) {
    console.log(`Received in pending invites: ${req.params.id}`);
    const query = await invitationApi.getPendingInvites(Number(req.params.id));
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to get pending invites for user ${req.params.id}`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.status(StatusCode.OK).json(query);
}

async function postInvite(req: Request, res: Response) {
    console.log(`Received in post invite: ${req.body.senderId} ${req.body.recipientId}`);
    const query = await invitationApi.createInvite(req.body.senderId, req.body.recipientId);
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to create invite between users ${req.body.senderId} ${req.body.recipientId}`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.sendStatus(StatusCode.OK);
    emailService.sendInviteEmail((query as InviteData[])[0], Subject.INVITATION);
}

async function acceptInvite(req: Request, res: Response) {
    console.log(`Received in accept invite: ${req.params.id}`);
    const query = await invitationApi.acceptInvite(Number(req.params.id), req.body.senderId, req.body.recipientId);
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to create invite between users ${req.body.senderId} ${req.body.recipientId}`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.sendStatus(StatusCode.OK);
    emailService.sendInviteEmail((query as InviteData[])[0], Subject.ACCEPTED);
}

async function rejectInvite(req: Request, res: Response) {
    console.log(`Received in accept invite: ${req.params.id}`);
    const query = await invitationApi.rejectInvite(Number(req.params.id));
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to create invite between users ${req.body.senderId} ${req.body.recipientId}`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.sendStatus(StatusCode.OK);
    emailService.sendInviteEmail((query as InviteData[])[0], Subject.REJECTED);
}

export {getInvites, getPendingInvites, postInvite, acceptInvite, rejectInvite};
