import { Router } from "express";
import { authenticateToken } from "../utils/token";
import * as SettingsProcessor from "../controller/processors/settingsProcessor";

const settingsRoute = Router();
settingsRoute.get("/get/:id", authenticateToken, SettingsProcessor.getSettings);
settingsRoute.put("/update/:id", authenticateToken, SettingsProcessor.updateSettings);

export default settingsRoute;
