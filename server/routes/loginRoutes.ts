import express from "express";
import { LoginAPI } from "../controller/loginProcessor";
import { initializeErrorMap } from "../utils/errorMessages";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { StatusCode } from "../types";

const loginRoutes = express.Router();
const loginAPI = new LoginAPI();
const ERROR_MESSAGES = initializeErrorMap();

loginRoutes.post('/login', async (req : any, res : any) => {
    console.log(`Received: ${req.body}`);
    const loginQuery = await loginAPI.verifyLogin(req.body.email, req.body.password);
    if(typeof loginQuery === typeof StatusCode) {
        console.log("Login verification failed.");
        res.status(loginQuery).send(ERROR_MESSAGES.get(loginQuery));
        return;
    }
    const accessToken = generateAccessToken(req.body.email);
    const refreshToken = generateRefreshToken(req.body.email);
    const tokenQuery = await loginAPI.setToken(loginQuery, refreshToken);
    if(tokenQuery !== StatusCode.OK) {
        console.log("Storing token failed.");
        res.status(tokenQuery).send(ERROR_MESSAGES.get(tokenQuery));
        return;
    }
    res.status(StatusCode.OK).json({id: loginQuery, accessToken, refreshToken});
});

loginRoutes.post('/token', async (req : any, res : any) => {
    console.log(`Received: ${req.body.refreshToken}`);
    const tokenQuery = await loginAPI.verifyToken(req.body.id, req.body.refreshToken);
    if(tokenQuery !== StatusCode.OK) {
        console.log("Token verification failed.");
        res.status(tokenQuery).send(ERROR_MESSAGES.get(tokenQuery));
        return;
    }
    const accessToken = generateAccessToken(req.body.email);
    res.status(StatusCode.OK).json({accessToken});
});

loginRoutes.post('/register', async(req : any, res : any) => {
    console.log(req.body);
    const accountStatusCode = await loginAPI.createAccount(req.body.email, req.body.password);
    if(accountStatusCode !== StatusCode.OK) {
        res.status(accountStatusCode).send(ERROR_MESSAGES.get(accountStatusCode));
        return;
    }
    res.sendStatus(StatusCode.OK);
});

loginRoutes.post('/logout', async(req : any, res : any) => {
    console.log(`Received in logout: ${req.body}`);
    const logoutQuery = await loginAPI.logout(req.body.id);
    if(logoutQuery !== StatusCode.OK) {
        res.status(logoutQuery).send(ERROR_MESSAGES.get(logoutQuery));
        return;
    }
    res.sendStatus(StatusCode.OK);
});

loginRoutes.delete('/delete/:id', async(req : any, res : any) => {
    console.log(`Received in delete account: ${req.params.id}`);
    const deleteQuery = await loginAPI.delete(req.params.id);
    if(deleteQuery !== StatusCode.OK) {
        res.status(deleteQuery).send(ERROR_MESSAGES.get(deleteQuery));
        return;
    }
    res.sendStatus(StatusCode.OK);
});

export default loginRoutes;
