import Analytics from "../models/Analytics.js"
import axios from "axios"

const META_GRAPH_API = "https://graph.instagram.com/v18.0"

export const syncMetaAdsData = async (req, res) => {
  try {
    const { accessToken, adAccountId, days = 30 } = req.body

    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Token et Ad Account ID requis" })
    }

    const url = `https://graph.facebook.com/v18.0/act_${adAccountId}/insights`

    const response = await axios.get(url, {
      params: {
        fields: "campaign_id,campaign_name,clicks,impressions,spend,actions,date_start,date_stop",
        access_token: accessToken,
        time_range: { since: `2025-01-01`, until: "today" },
        level: "campaign",
      },
    })

    const records = response.data.data.map((row) => {
      const conversions =
        row.actions?.reduce((sum, action) => {
          if (action.action_type === "offsite_conversion") {
            return sum + action.value
          }
          return sum
        }, 0) || 0

      return {
        campaignId: row.campaign_id,
        source: "meta_ads",
        clicks: Number.parseInt(row.clicks) || 0,
        impressions: Number.parseInt(row.impressions) || 0,
        cost: Number.parseFloat(row.spend) || 0,
        conversions: conversions,
        metaData: {
          campaignName: row.campaign_name,
          dateStart: row.date_start,
          dateStop: row.date_stop,
        },
        date: new Date(row.date_start),
      }
    })

    if (records.length > 0) {
      await Analytics.insertMany(records)
    }

    res.json({
      message: "Données Meta Ads synchronisées avec succès",
      recordsCount: records.length,
      data: records,
    })
  } catch (error) {
    console.error("[Meta Ads Error]", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const getMetaAdsMetrics = async (req, res) => {
  try {
    const { adAccountId } = req.params
    const { accessToken } = req.headers

    if (!accessToken) {
      return res.status(400).json({ error: "Token requis" })
    }

    const url = `https://graph.facebook.com/v18.0/act_${adAccountId}/insights`

    const response = await axios.get(url, {
      params: {
        fields: "clicks,impressions,spend,actions",
        access_token: accessToken,
        time_range: { since: "2025-01-01", until: "today" },
      },
    })

    const data = response.data.data[0] || {}

    const totalConversions =
      data.actions?.reduce((sum, action) => {
        if (action.action_type === "offsite_conversion") {
          return sum + action.value
        }
        return sum
      }, 0) || 0

    const metrics = {
      totalClicks: Number.parseInt(data.clicks) || 0,
      totalImpressions: Number.parseInt(data.impressions) || 0,
      totalSpend: Number.parseFloat(data.spend) || 0,
      totalConversions: totalConversions,
      cpc: data.clicks ? (Number.parseFloat(data.spend) / Number.parseInt(data.clicks)).toFixed(2) : 0,
      cpm: data.impressions
        ? ((Number.parseFloat(data.spend) / Number.parseInt(data.impressions)) * 1000).toFixed(2)
        : 0,
      conversionRate: data.clicks ? ((totalConversions / Number.parseInt(data.clicks)) * 100).toFixed(2) : 0,
    }

    res.json(metrics)
  } catch (error) {
    console.error("[Meta Ads Metrics Error]", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const getMetaAdsCampaignPerformance = async (req, res) => {
  try {
    const { adAccountId } = req.params
    const { accessToken } = req.headers

    if (!accessToken) {
      return res.status(400).json({ error: "Token requis" })
    }

    const url = `https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns`

    const response = await axios.get(url, {
      params: {
        fields: "name,status,effective_status,spend",
        access_token: accessToken,
      },
    })

    const campaigns = response.data.data || []

    res.json({
      totalCampaigns: campaigns.length,
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        effectiveStatus: campaign.effective_status,
        spend: Number.parseFloat(campaign.spend) || 0,
      })),
    })
  } catch (error) {
    console.error("[Meta Ads Campaign Error]", error.message)
    res.status(500).json({ error: error.message })
  }
}