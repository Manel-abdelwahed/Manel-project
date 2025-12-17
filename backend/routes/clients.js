import express from "express"
import auth from "../middleware/authMiddleware.js"
import { getClients, createClient, updateClient, deleteClient } from "../controllers/clientController.js"

const router = express.Router()

router.get("/", auth, getClients)
router.post("/", auth, createClient)
router.put("/:id", auth, updateClient)
router.delete("/:id", auth, deleteClient)

export default router
