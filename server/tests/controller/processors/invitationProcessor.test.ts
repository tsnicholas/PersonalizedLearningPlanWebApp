import * as InvitationProcessor from "../../../controller/processors/invitationProcessor";
import InvitationApi from "../../../controller/api/invitationApi";
import EmailService from "../../../service/emailService";
import { StatusCode, Subject } from "../../../types";
import { initializeErrorMap } from "../../../utils/errorMessages";
import { createMockRequest, MOCK_RESPONSE, TEST_INVITE } from "../global/mockValues";

jest.mock("../../../controller/api/invitationApi");
jest.mock("../../../service/emailService");

const ERROR_MESSAGES = initializeErrorMap();


describe("Invitation Processor Unit Tests", () => {
    var invitationApi: any;
    var emailService: any;

    beforeEach(() => {
        invitationApi = new InvitationApi();
        emailService = new EmailService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get invites (normal case)", async () => {
        invitationApi.getInvites.mockResolvedValueOnce([TEST_INVITE]);
        const mRequest = createMockRequest({}, {id: TEST_INVITE.recipientId});
        await InvitationProcessor.getInvites(mRequest, MOCK_RESPONSE);
        expect(invitationApi.getInvites).toHaveBeenCalledTimes(1);
        expect(invitationApi.getInvites).toHaveBeenCalledWith(TEST_INVITE.recipientId);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.OK);
        expect(MOCK_RESPONSE.json).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.json).toHaveBeenCalledWith([TEST_INVITE]);
    });

    it("get invites (error case)", async () => {
        invitationApi.getInvites.mockResolvedValueOnce(StatusCode.BAD_REQUEST);
        const mRequest = createMockRequest({}, {id: TEST_INVITE.recipientId});
        await InvitationProcessor.getInvites(mRequest, MOCK_RESPONSE);
        expect(invitationApi.getInvites).toHaveBeenCalledTimes(1);
        expect(invitationApi.getInvites).toHaveBeenCalledWith(TEST_INVITE.recipientId);
        expect(MOCK_RESPONSE.json).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.BAD_REQUEST);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledWith(ERROR_MESSAGES.get(StatusCode.BAD_REQUEST));
    });

    it("get pending invites (normal case)", async () => {
        invitationApi.getPendingInvites.mockResolvedValueOnce([TEST_INVITE]);
        const mRequest = createMockRequest({}, {id: TEST_INVITE.senderId});
        await InvitationProcessor.getPendingInvites(mRequest, MOCK_RESPONSE);
        expect(invitationApi.getPendingInvites).toHaveBeenCalledTimes(1);
        expect(invitationApi.getPendingInvites).toHaveBeenCalledWith(TEST_INVITE.senderId);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.OK);
        expect(MOCK_RESPONSE.json).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.json).toHaveBeenCalledWith([TEST_INVITE]);
    });

    it("get pending invites (error case)", async () => {
        invitationApi.getPendingInvites.mockResolvedValueOnce(StatusCode.CONFLICT);
        const mRequest = createMockRequest({}, {id: TEST_INVITE.senderId});
        await InvitationProcessor.getPendingInvites(mRequest, MOCK_RESPONSE);
        expect(invitationApi.getPendingInvites).toHaveBeenCalledTimes(1);
        expect(invitationApi.getPendingInvites).toHaveBeenCalledWith(TEST_INVITE.senderId);
        expect(MOCK_RESPONSE.json).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.CONFLICT);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledWith(ERROR_MESSAGES.get(StatusCode.CONFLICT));
    });

    it("post invite (normal case)", async () => {
        invitationApi.createInvite.mockResolvedValueOnce([TEST_INVITE]);
        emailService.sendInviteEmail.mockResolvedValueOnce();
        const mRequest = createMockRequest({senderId: TEST_INVITE.senderId, recipientId: TEST_INVITE.recipientId});
        await InvitationProcessor.postInvite(mRequest, MOCK_RESPONSE);
        expect(invitationApi.createInvite).toHaveBeenCalledTimes(1);
        expect(invitationApi.createInvite).toHaveBeenCalledWith(TEST_INVITE.senderId, TEST_INVITE.recipientId);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledWith(StatusCode.OK);
        expect(emailService.sendInviteEmail).toHaveBeenCalledTimes(1);
        expect(emailService.sendInviteEmail).toHaveBeenCalledWith(TEST_INVITE, Subject.INVITATION);
    });

    it("post invite (error case)", async () => {
        invitationApi.createInvite.mockResolvedValueOnce(StatusCode.FORBIDDEN);
        const mRequest = createMockRequest({senderId: TEST_INVITE.senderId, recipientId: TEST_INVITE.recipientId});
        await InvitationProcessor.postInvite(mRequest, MOCK_RESPONSE);
        expect(invitationApi.createInvite).toHaveBeenCalledTimes(1);
        expect(invitationApi.createInvite).toHaveBeenCalledWith(TEST_INVITE.senderId, TEST_INVITE.recipientId);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.FORBIDDEN);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledWith(ERROR_MESSAGES.get(StatusCode.FORBIDDEN));
        expect(emailService.sendInviteEmail).toHaveBeenCalledTimes(0);
    });

    it("accept invite (normal case)", async () => {
        invitationApi.acceptInvite.mockResolvedValueOnce([TEST_INVITE]);
        emailService.sendInviteEmail.mockResolvedValueOnce();
        const mRequest = createMockRequest({senderId: TEST_INVITE.senderId, recipientId: TEST_INVITE.recipientId}, {id: TEST_INVITE.id});
        await InvitationProcessor.acceptInvite(mRequest, MOCK_RESPONSE);
        expect(invitationApi.acceptInvite).toHaveBeenCalledTimes(1);
        expect(invitationApi.acceptInvite).toHaveBeenCalledWith(TEST_INVITE.id, TEST_INVITE.senderId, TEST_INVITE.recipientId);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledWith(StatusCode.OK);
        expect(emailService.sendInviteEmail).toHaveBeenCalledTimes(1);
        expect(emailService.sendInviteEmail).toHaveBeenCalledWith(TEST_INVITE, Subject.ACCEPTED);
    });

    it("accept invite (error case)", async () => {
        invitationApi.acceptInvite.mockResolvedValueOnce(StatusCode.BAD_REQUEST);
        emailService.sendInviteEmail.mockResolvedValueOnce();
        const mRequest = createMockRequest({senderId: TEST_INVITE.senderId, recipientId: TEST_INVITE.recipientId}, {id: TEST_INVITE.id});
        await InvitationProcessor.acceptInvite(mRequest, MOCK_RESPONSE);
        expect(invitationApi.acceptInvite).toHaveBeenCalledTimes(1);
        expect(invitationApi.acceptInvite).toHaveBeenCalledWith(TEST_INVITE.id, TEST_INVITE.senderId, TEST_INVITE.recipientId);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.BAD_REQUEST);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledWith(ERROR_MESSAGES.get(StatusCode.BAD_REQUEST));
        expect(emailService.sendInviteEmail).toHaveBeenCalledTimes(0);
    });

    it("reject invite (normal case)", async () => {
        invitationApi.rejectInvite.mockResolvedValueOnce([TEST_INVITE]);
        emailService.sendInviteEmail.mockResolvedValueOnce();
        const mRequest = createMockRequest({}, {id: TEST_INVITE.id});
        await InvitationProcessor.rejectInvite(mRequest, MOCK_RESPONSE);
        expect(invitationApi.rejectInvite).toHaveBeenCalledTimes(1);
        expect(invitationApi.rejectInvite).toHaveBeenCalledWith(TEST_INVITE.id);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledWith(StatusCode.OK);
        expect(emailService.sendInviteEmail).toHaveBeenCalledTimes(1);
        expect(emailService.sendInviteEmail).toHaveBeenCalledWith(TEST_INVITE, Subject.REJECTED);
    });

    it("reject invite (error case)", async () => {
        invitationApi.rejectInvite.mockResolvedValueOnce(StatusCode.GONE);
        const mRequest = createMockRequest({}, {id: TEST_INVITE.id});
        await InvitationProcessor.rejectInvite(mRequest, MOCK_RESPONSE);
        expect(invitationApi.rejectInvite).toHaveBeenCalledTimes(1);
        expect(invitationApi.rejectInvite).toHaveBeenCalledWith(TEST_INVITE.id);
        expect(MOCK_RESPONSE.sendStatus).toHaveBeenCalledTimes(0);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.status).toHaveBeenCalledWith(StatusCode.GONE);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledTimes(1);
        expect(MOCK_RESPONSE.send).toHaveBeenCalledWith(ERROR_MESSAGES.get(StatusCode.GONE));
        expect(emailService.sendInviteEmail).toHaveBeenCalledTimes(0);
    });
});
