import mongoose from "mongoose"

const analyticsSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    source: { type: String, required: true },
    clicks: Number,
    impressions: Number,
    cost: Number,
    conversions: Number,
    reach: Number,
    frequency: Number,
    cpc: Number,
    cpm: Number,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const Analytics = mongoose.model("Analytics", analyticsSchema)

export default Analytics
