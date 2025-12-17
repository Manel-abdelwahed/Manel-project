import express from "express"
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from "../controllers/taskController.js"
import { auth } from "../middleware/authMiddleware.js"

const router = express.Router()

// All task routes require authentication
router.get("/", auth, getTasks)
router.get("/:id", auth, getTaskById)
router.post("/", auth, createTask)
router.put("/:id", auth, updateTask)
router.delete("/:id", auth, deleteTask)

export default router
