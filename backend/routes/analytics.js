import express from "express"
import Analytics from "../models/Analytics.js"
import axios from "axios"
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { getDashboardStats } from "../controllers/analyticsController.js"
import { auth } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/dashboard", auth, getDashboardStats)

// ✅ Ajout manuel
router.post("/add", async (req, res) => {
  try {
    const analytics = new Analytics(req.body)
    await analytics.save()
    res.status(201).json({ message: "Analytics saved", analytics })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ✅ GET par campagne
router.get("/:campaignId", async (req, res) => {
  try {
    const stats = await Analytics.find({ campaignId: req.params.campaignId })
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ Synchronisation Facebook
router.get("/sync/facebook/:campaignId/:accessToken/:adAccountId", async (req, res) => {
  const { campaignId, accessToken, adAccountId } = req.params
  try {
    const fields = "clicks,impressions,spend,actions"
    const resp = await axios.get(`https://graph.facebook.com/v16.0/${adAccountId}/insights`, {
      params: {
        fields,
        access_token: accessToken,
        time_range: { since: "2025-01-01", until: "today" },
        level: "campaign",
        filters: [`{field:"campaign.id",operator:EQUAL,values:["${campaignId}"]}`],
      },
    })

    const records = resp.data.data.map((r) => ({
      campaignId,
      source: "facebook",
      clicks: Number.parseInt(r.clicks) || 0,
      impressions: Number.parseInt(r.impressions) || 0,
      cost: Number.parseFloat(r.spend) || 0,
      conversions: r.actions?.find((a) => a.action_type === "offsite_conversion")?.value || 0,
      date: new Date(r.date_start),
    }))

    await Analytics.insertMany(records)
    res.json({ message: "Facebook sync ok", count: records.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ Synchronisation Google Analytics
router.get("/sync/google/:campaignId", async (req, res) => {
  try {
    const client = new BetaAnalyticsDataClient({
      keyFilename: process.env.GOOGLE_KEYFILE,
    })
    const propertyId = process.env.GOOGLE_PROPERTY_ID

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "campaignName" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
    })

    const records = response.rows.map((row) => ({
      campaignId: req.params.campaignId,
      source: "google",
      clicks: Number.parseInt(row.metricValues[0]?.value) || 0,
      impressions: Number.parseInt(row.metricValues[1]?.value) || 0,
      conversions: 0,
      cost: 0,
      date: new Date(),
    }))

    await Analytics.insertMany(records)
    res.json({ message: "Google sync ok", count: records.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Meta Ads synchronization endpoint
router.get("/sync/meta/:campaignId/:accessToken/:adAccountId", async (req, res) => {
  const { campaignId, accessToken, adAccountId } = req.params
  try {
    const fields = "campaign_id,campaign_name,adset_id,impressions,clicks,spend,actions,action_values"
    const resp = await axios.get(`https://graph.instagram.com/v16.0/${adAccountId}/insights`, {
      params: {
        fields,
        access_token: accessToken,
        time_range: JSON.stringify({ since: "2025-01-01", until: new Date().toISOString().split("T")[0] }),
        level: "campaign",
        filtering: [{ field: "campaign.id", operator: "EQUAL", value: [campaignId] }],
      },
    })

    const records = []
    if (resp.data.data && Array.isArray(resp.data.data)) {
      for (const campaign of resp.data.data) {
        const insights = campaign.insights?.data?.[0] || campaign

        const record = {
          source: "meta",
          campaignId: campaign.id,
          clicks: Number.parseInt(insights.clicks) || 0,
          impressions: Number.parseInt(insights.impressions) || 0,
          cost: Number.parseFloat(insights.spend) || 0,
          conversions:
            insights.actions?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion")
              ?.value || 0,
          reach: Number.parseInt(insights.reach) || 0,
          frequency: Number.parseFloat(insights.frequency) || 0,
          cpc: Number.parseFloat(insights.cpc) || 0,
          cpm: Number.parseFloat(insights.cpm) || 0,
          date: new Date(),
        }

        records.push(record)
      }
    }

    // Save all records without campaign reference (no campaignId needed for global sync)
    if (records.length > 0) {
      await Analytics.insertMany(records)
    }

    res.json({
      message: "Meta Ads sync successful",
      count: records.length,
      data: records,
    })
  } catch (err) {
    console.error("Meta Ads sync error:", err.response?.data || err.message)
    res.status(500).json({ error: err.message, details: err.response?.data })
  }
})

router.get("/sync/meta-all/:accessToken/:adAccountId", async (req, res) => {
  const { accessToken, adAccountId } = req.params
  try {
    console.log("[v0] Starting Meta Ads sync with Account ID:", adAccountId)

    const fields = "campaign_id,campaign_name,impressions,clicks,spend,actions,reach,frequency,cpc,cpm"

    const resp = await axios.get(`https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns`, {
      params: {
        fields: `${fields},insights{${fields}}`,
        access_token: accessToken,
        time_range: JSON.stringify({ since: "2024-01-01", until: new Date().toISOString().split("T")[0] }),
        limit: 100,
      },
    })

    console.log("[v0] Meta API Response:", resp.data)

    const records = []
    if (resp.data.data && Array.isArray(resp.data.data)) {
      for (const campaign of resp.data.data) {
        const insights = campaign.insights?.data?.[0] || campaign

        const record = {
          source: "meta",
          campaignId: campaign.id,
          clicks: Number.parseInt(insights.clicks) || 0,
          impressions: Number.parseInt(insights.impressions) || 0,
          cost: Number.parseFloat(insights.spend) || 0,
          conversions:
            insights.actions?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion")
              ?.value || 0,
          reach: Number.parseInt(insights.reach) || 0,
          frequency: Number.parseFloat(insights.frequency) || 0,
          cpc: Number.parseFloat(insights.cpc) || 0,
          cpm: Number.parseFloat(insights.cpm) || 0,
          date: new Date(),
        }

        records.push(record)
      }
    }

    // Save all records without campaign reference (no campaignId needed for global sync)
    if (records.length > 0) {
      await Analytics.insertMany(records)
    }

    res.json({
      message: "Meta Ads sync successful",
      count: records.length,
      data: records,
    })
  } catch (err) {
    console.error("[v0] Meta Ads sync error:", err.response?.data || err.message)
    res.status(500).json({ error: err.message, details: err.response?.data })
  }
})

// Meta Ads stats endpoint
router.get("/meta/stats", auth, async (req, res) => {
  try {
    const metaAnalytics = await Analytics.aggregate([
      { $match: { source: "meta" } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
          totalImpressions: { $sum: "$impressions" },
          totalSpend: { $sum: "$cost" },
          totalConversions: { $sum: "$conversions" },
          avgCPC: { $avg: "$cpc" },
          avgCPM: { $avg: "$cpm" },
          totalReach: { $sum: "$reach" },
        },
      },
    ])

    const metaStats =
      metaAnalytics.length > 0
        ? metaAnalytics[0]
        : {
            totalClicks: 0,
            totalImpressions: 0,
            totalSpend: 0,
            totalConversions: 0,
            avgCPC: 0,
            avgCPM: 0,
            totalReach: 0,
          }

    res.json(metaStats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/sync-and-get/meta/:accessToken/:adAccountId", auth, async (req, res) => {
  const { accessToken, adAccountId } = req.params
  try {
    console.log("[v0] Starting Meta Ads sync and retrieve with Account ID:", adAccountId)

    const fields = "campaign_id,campaign_name,impressions,clicks,spend,actions,reach,frequency,cpc,cpm"

    const resp = await axios.get(`https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns`, {
      params: {
        fields: `${fields},insights{${fields}}`,
        access_token: accessToken,
        time_range: JSON.stringify({ since: "2024-01-01", until: new Date().toISOString().split("T")[0] }),
        limit: 100,
      },
    })

    console.log("[v0] Meta API Response:", resp.data)

    const records = []
    if (resp.data.data && Array.isArray(resp.data.data)) {
      for (const campaign of resp.data.data) {
        const insights = campaign.insights?.data?.[0] || campaign

        const record = {
          source: "meta",
          campaignId: campaign.id,
          clicks: Number.parseInt(insights.clicks) || 0,
          impressions: Number.parseInt(insights.impressions) || 0,
          cost: Number.parseFloat(insights.spend) || 0,
          conversions:
            insights.actions?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion")
              ?.value || 0,
          reach: Number.parseInt(insights.reach) || 0,
          frequency: Number.parseFloat(insights.frequency) || 0,
          cpc: Number.parseFloat(insights.cpc) || 0,
          cpm: Number.parseFloat(insights.cpm) || 0,
          date: new Date(),
        }

        records.push(record)
      }
    }

    // Save all records
    if (records.length > 0) {
      await Analytics.insertMany(records)
      console.log("[v0] Saved", records.length, "Meta records to database")
    }

    // Get aggregated stats
    const metaAnalytics = await Analytics.aggregate([
      { $match: { source: "meta" } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
          totalImpressions: { $sum: "$impressions" },
          totalSpend: { $sum: "$cost" },
          totalConversions: { $sum: "$conversions" },
          avgCPC: { $avg: "$cpc" },
          avgCPM: { $avg: "$cpm" },
          totalReach: { $sum: "$reach" },
        },
      },
    ])

    const metaStats =
      metaAnalytics.length > 0
        ? metaAnalytics[0]
        : {
            totalClicks: 0,
            totalImpressions: 0,
            totalSpend: 0,
            totalConversions: 0,
            avgCPC: 0,
            avgCPM: 0,
            totalReach: 0,
          }

    res.json({
      message: "Meta Ads sync successful and stats retrieved",
      count: records.length,
      stats: metaStats,
    })
  } catch (err) {
    console.error("[v0] Meta Ads sync error:", err.response?.data || err.message)
    res.status(500).json({ error: err.message, details: err.response?.data })
  }
})

export default router