import express from "express"
import { syncMetaAdsData, getMetaAdsMetrics, getMetaAdsCampaignPerformance } from "../controllers/metaAdsController.js"
import { auth } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/sync", auth, syncMetaAdsData)

router.get("/metrics/:adAccountId", auth, getMetaAdsMetrics)

router.get("/campaigns/:adAccountId", auth, getMetaAdsCampaignPerformance)

export default router