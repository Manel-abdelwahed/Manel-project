import mongoose from "mongoose"

const campaignSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    budget: Number,
    status: { type: String, enum: ["active", "paused", "completed"], default: "active" },
    platform: String,
    targetAudience: String,
  },
  { timestamps: true },
)

const Campaign = mongoose.model("Campaign", campaignSchema)

export default Campaign
