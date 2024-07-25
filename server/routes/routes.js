import { Router } from "express";
import { createUser, getUser, getUsers, updateUser, updateUserHighScore } from "../controllers/userControllers.js";

const router = Router();

router.get("/api/v1/getUsers", getUsers );
router.post("/api/v1/createUser", createUser );
router.get("/api/v1/getUser/:id", getUser );
router.patch("/api/v1/updateUser/:id", updateUser );
router.post('/api/v1/users/highscore/:id', updateUserHighScore);

export default router;