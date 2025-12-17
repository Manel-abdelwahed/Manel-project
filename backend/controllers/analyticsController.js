import Campaign from "../models/Campaign.js"
import Client from "../models/Client.js"
import Analytics from "../models/Analytics.js"

export const getDashboardStats = async (req, res) => {
  try {
    // Get total campaigns
    const totalCampaigns = await Campaign.countDocuments()

    // Get active campaigns
    const activeCampaigns = await Campaign.countDocuments({ status: "active" })

    // Get total clients
    const totalClients = await Client.countDocuments()

    // Calculate total revenue (sum of all campaign budgets)
    const campaigns = await Campaign.find()
    const totalRevenue = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)

    const campaignPerformance = campaigns.map((campaign) => ({
      name: campaign.name || campaign.title,
      budget: campaign.budget || 0,
      status: campaign.status,
      platform: campaign.platform || "Unknown",
    }))

    const clientsBySource = await Client.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          source: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ])

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalClients,
      totalRevenue,
      campaignPerformance,
      clientsBySource: clientsBySource.length > 0 ? clientsBySource : [{ source: "Direct", count: totalClients }],
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.create(req.body)
    res.status(201).json(analytics)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAnalyticsByCampaign = async (req, res) => {
  try {
    const analytics = await Analytics.find({ campaignId: req.params.campaignId })
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}