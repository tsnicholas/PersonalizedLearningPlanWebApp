import { Router } from "express";
import { authenticateToken } from "../utils/token";
import * as GoalProcessor from "../controller/processors/goalProcessor";

const goalRoutes = Router();
goalRoutes.get("/get/module/:id", authenticateToken, GoalProcessor.getModuleGoals);
goalRoutes.post("/add", authenticateToken, GoalProcessor.postGoal);
goalRoutes.put("/update/:id", authenticateToken, GoalProcessor.putGoal);
goalRoutes.put('/update/feedback/:id', authenticateToken, GoalProcessor.putGoalFeedback);
goalRoutes.delete("/delete/:id", authenticateToken, GoalProcessor.deleteGoal);
goalRoutes.get("/get/:id/:variable", authenticateToken, GoalProcessor.getGoalVariable);
goalRoutes.post("/add/:id", authenticateToken, GoalProcessor.postSubGoal);

export default goalRoutes;
