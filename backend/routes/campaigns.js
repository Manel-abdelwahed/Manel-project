import express from "express"
import auth from "../middleware/authMiddleware.js"
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from "../controllers/campaignController.js"

const router = express.Router()

router.get("/", auth, getCampaigns)
router.post("/", auth, createCampaign)
router.put("/:id", auth, updateCampaign)
router.delete("/:id", auth, deleteCampaign)

export default router
