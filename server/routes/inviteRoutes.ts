import { Router } from "express";
import { authenticateToken } from "../utils/token";
import * as InvitationProcessor from "../controller/processors/invitationProcessor";

const inviteRoutes = Router();
inviteRoutes.get("/:id", authenticateToken, InvitationProcessor.getInvites);
inviteRoutes.get("/pending/:id", authenticateToken, InvitationProcessor.getPendingInvites);
inviteRoutes.put("/create", authenticateToken, InvitationProcessor.postInvite);
inviteRoutes.post("/accept/:id", authenticateToken, InvitationProcessor.acceptInvite);
inviteRoutes.post("/reject/:id", authenticateToken, InvitationProcessor.rejectInvite);

export default inviteRoutes;
