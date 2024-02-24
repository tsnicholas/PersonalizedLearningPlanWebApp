export {};

import bcrypt from "bcryptjs";
import LoginAPI from "../../../controller/api/loginApi";
import LoginParser from "../../../parser/loginParser";
import { StatusCode } from "../../../types";
import { FAKE_ERRORS } from "./universal/fakeErrors";
jest.mock("../../../parser/loginParser");

describe('Login Functions', () => {
    const testData = {
        id: 12,
        email: "George123@Gmail.com",
        password: "password",
        refreshToken: "UTDefpAEyREXmgCkK04pL1SXK6jrB2tEc2ZyMbrFs61THq2y3bpRZOCj5RiPoZGa",
    };
    
    let loginAPI : LoginAPI;
    let parser : any;

    beforeEach(() => {
        parser = new LoginParser();
        loginAPI = new LoginAPI();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('verify login (pass case)', async () => {
        parser.retrieveLogin.mockResolvedValueOnce([
            {id: testData.id, email: testData.email, account_password: testData.password}
        ]);
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce((password, hash) => Promise.resolve(password == hash));
        expect(await loginAPI.verifyLogin(testData.email, testData.password)).toEqual(testData.id);
    });

    it('verify login (email does not exist case)', async () => {
        parser.retrieveLogin.mockResolvedValueOnce([]);
        const result = await loginAPI.verifyLogin(testData.email, testData.password);
        expect(parser.retrieveLogin).toHaveBeenCalledTimes(1);
        expect(parser.retrieveLogin).toHaveBeenCalledWith(testData.email);
        expect(result).toEqual(StatusCode.GONE);
    });

    it('verify login (wrong password case)', async () => {
        parser.retrieveLogin.mockResolvedValueOnce([
            {email: testData.email, account_password: testData.password}
        ]);
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce((s, hash, callback) => {return callback});
        expect(await loginAPI.verifyLogin(testData.email, testData.password)).toEqual(StatusCode.UNAUTHORIZED);
    });

    it('create account (pass case)', async () => {
        jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce((rounds, callback) => callback);
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce((s, salt, callback) => callback);
        parser.storeLogin.mockResolvedValueOnce();
        expect(await loginAPI.createAccount(testData.email, testData.password)).toEqual(StatusCode.OK);
    });

    it('create account (duplicate case)', async () => {
        jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce((rounds, callback) => callback);
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce((s, salt, callback) => callback);
        parser.storeLogin.mockRejectedValue(FAKE_ERRORS.primaryKeyViolation);
        expect(await loginAPI.createAccount(testData.email, testData.password)).toEqual(StatusCode.CONFLICT);
    });

    it('create account (connection lost case)', async () => {
        jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce((rounds, callback) => callback);
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce((s, salt, callback) => callback);
        parser.storeLogin.mockRejectedValue(FAKE_ERRORS.networkError);
        expect(await loginAPI.createAccount(testData.email, testData.password)).toEqual(StatusCode.CONNECTION_ERROR);
    });

    it('create account (bad data case)', async () => {
        parser.storeLogin.mockRejectedValue(FAKE_ERRORS.badRequest);
        expect(await loginAPI.createAccount(testData.email, testData.password)).toEqual(StatusCode.BAD_REQUEST);
    });

    it('create account (fatal error case)', async () => {
        jest.spyOn(bcrypt, 'genSalt').mockImplementationOnce((rounds, callback) => callback);
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce((s, salt, callback) => callback);
        parser.storeLogin.mockRejectedValue(FAKE_ERRORS.fatalServerError);
        expect(await loginAPI.createAccount(testData.email, testData.password)).toEqual(StatusCode.INTERNAL_SERVER_ERROR);
    });

    it('set token (pass case)', async () => {
        parser.storeToken.mockResolvedValueOnce();
        expect(await loginAPI.setToken(testData.id, testData.refreshToken)).toEqual(StatusCode.OK);
    });

    it('set token (connection lost case)', async () => {
        parser.storeToken.mockRejectedValue(FAKE_ERRORS.networkError);
        expect(await loginAPI.setToken(testData.id, testData.refreshToken)).toEqual(StatusCode.CONNECTION_ERROR);
    });

    it('set token (bad data case)', async () => {
        parser.storeToken.mockRejectedValue(FAKE_ERRORS.badRequest);
        expect(await loginAPI.setToken(testData.id, testData.refreshToken)).toEqual(StatusCode.BAD_REQUEST);
    });

    it('set token (fatal error case)', async () => {
        parser.storeToken.mockRejectedValue(FAKE_ERRORS.fatalServerError);
        expect(await loginAPI.setToken(testData.id, testData.refreshToken)).toEqual(StatusCode.INTERNAL_SERVER_ERROR);
    });

    it('verify token (pass case)', async () => {
        parser.parseToken.mockResolvedValueOnce([{'refresh_token': testData.refreshToken}]);
        expect(await loginAPI.verifyToken(testData.id, testData.refreshToken)).toEqual(StatusCode.OK);
    });

    it('verify token (unauthorized case)', async () => {
        parser.parseToken.mockResolvedValueOnce([{'refresh_token': "I'm a wrong token"}]);
        expect(await loginAPI.verifyToken(testData.id, testData.refreshToken)).toEqual(StatusCode.UNAUTHORIZED);
    });

    it('verify token (gone case)', async () => {
        parser.parseToken.mockResolvedValueOnce([]);
        expect(await loginAPI.verifyToken(testData.id, testData.refreshToken)).toEqual(StatusCode.GONE);
    });

    it('verify token (bad data case)', async () => {
        parser.parseToken.mockRejectedValue(FAKE_ERRORS.badRequest);
        expect(await loginAPI.verifyToken(testData.id, testData.refreshToken)).toEqual(StatusCode.BAD_REQUEST);
    });

    it('verify token (fatal error case)', async () => {
        parser.parseToken.mockRejectedValue(FAKE_ERRORS.fatalServerError);
        expect(await loginAPI.verifyToken(testData.id, testData.refreshToken)).toEqual(StatusCode.INTERNAL_SERVER_ERROR);
    });

    it('logout (pass case)', async () => {
        parser.deleteToken.mockResolvedValueOnce();
        expect(await loginAPI.logout(testData.id)).toEqual(StatusCode.OK);
    });

    it('logout (error case)', async () => {
        parser.deleteToken.mockRejectedValue(FAKE_ERRORS.badRequest);
        expect(await loginAPI.logout(testData.id)).toEqual(StatusCode.BAD_REQUEST);
    });

    it('delete account (pass case)', async () => {
        parser.deleteAccount.mockResolvedValueOnce();
        expect(await loginAPI.delete(testData.id)).toEqual(StatusCode.OK);
    });

    it('delete account (error case)', async () => {
        parser.deleteAccount.mockRejectedValue(FAKE_ERRORS.badRequest);
        expect(await loginAPI.delete(testData.id)).toEqual(StatusCode.BAD_REQUEST);
    });
});
