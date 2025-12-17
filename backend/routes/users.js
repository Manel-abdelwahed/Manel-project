import express from "express"
import auth from "../middleware/authMiddleware.js"
import verifyRole from "../middleware/roleMiddleware.js"
import { getUsers, createUser, updateUser, deleteUser, updateOwnProfile } from "../controllers/userController.js"

const router = express.Router()

router.put("/profile/me", auth, updateOwnProfile)

router.get("/", auth, verifyRole("admin"), getUsers)
router.post("/", auth, verifyRole("admin"), createUser)
router.put("/:id", auth, verifyRole("admin"), updateUser)
router.delete("/:id", auth, verifyRole("admin"), deleteUser)

export default router
