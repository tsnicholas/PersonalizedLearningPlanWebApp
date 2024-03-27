import MessageApi from "../api/messageApi";
import { initializeErrorMap } from "../../utils/errorMessages";
import { Request, Response } from "express";
import { StatusCode } from "../../types";

const ERROR_MESSAGES = initializeErrorMap();
const messageApi = new MessageApi();

export async function getAllSentMessages(req: Request, res: Response) {
    console.log(`Id received in get all sent messages: ${req.params.id}`);
    const query = await messageApi.getAllSentMessages(Number(req.params.id));
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to get all sent messages for user with account id ${req.params.id}`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.status(StatusCode.OK).json(query);
}

export async function getMessagesBetween(req: Request, res: Response) {
    console.log(`Data received in getMessagesBetween: ${req.params.id} ${req.params.recipientId}`);
    const query = await messageApi.getChatMessages(Number(req.params.id), Number(req.params.recipientId));
    if(query as StatusCode in StatusCode) {
        console.log(`Failed to get messages between users ${req.params.id} ${req.params.recipientId}!`);
        res.status(query as StatusCode).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.status(StatusCode.OK).json(query);
}

export async function postMessage(req: Request, res: Response) {
    console.log(`Data received in post message: ${req.body.senderId} ${req.body.recipientId}`);
    const query = await messageApi.sendMessage({
        content: req.body.content,
        senderId: req.body.senderId,
        recipientId: req.body.recipientId
    });
    if(query !== StatusCode.OK) {
        console.log(`Failed to post message with content "${req.body.content}"!`);
        res.status(query).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.sendStatus(StatusCode.OK);
}

export async function putMessage(req: Request, res: Response) {
    console.log(`Data received in put message: ${req.params.id} ${JSON.stringify(req.body)}`);
    const query = await messageApi.editMessage(Number(req.params.id), req.body.content);
    if(query !== StatusCode.OK) {
        console.log(`Failed to edit message with id ${req.params.id}`);
        res.status(query).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.sendStatus(StatusCode.OK);
}

export async function deleteMessage(req: Request, res: Response) {
    console.log(`Id received in delete message: ${req.params.id}`);
    const query = await messageApi.deleteMessage(Number(req.params.id));
    if(query !== StatusCode.OK) {
        console.log(`Failed to delete message with id ${req.params.id}!`);
        res.status(query).send(ERROR_MESSAGES.get(query));
        return;
    }
    res.sendStatus(StatusCode.OK);
}