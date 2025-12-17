import mongoose from "mongoose"

const leadSchema = new mongoose.Schema(
  {
    /* ======================
       👤 INFORMATIONS LEAD
    ====================== */
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: String,
    source: String,
    notes: String,

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
    },

    leadScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /* ======================
       📅 SUIVI
    ====================== */
    lastContactDate: Date,
    nextFollowUpDate: Date,

    /* ======================
       👥 ASSIGNATION
    ====================== */
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // responsable CRM
    },

   commercial: {
  type: String,
  trim: true,
},

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* ======================
       📣 CAMPAGNE
    ====================== */
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },

    /* ======================
       ⚡ DONNÉES TECHNIQUES (SOLAIRE)
    ====================== */
    powerKW: {
      type: Number, // puissance installée
      min: 0,
    },

    needType: {
      type: String,
      enum: ["pompage", "raccordement"],
    },

    /* ======================
       💬 HISTORIQUE
    ====================== */
    interactions: [
      {
        type: String,
        date: Date,
        notes: String,
      },
    ],

    /* ======================
       💰 BUSINESS / VENTE
    ====================== */
    dealAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    convertedAt: Date,
  },
  {
    timestamps: true,
  }
)

/* ======================
   ✅ VALIDATION MÉTIER
====================== */
leadSchema.pre("save", function (next) {
  if (this.status === "converted") {
    if (!this.dealAmount || this.dealAmount <= 0) {
      return next(
        new Error("Le montant de la vente est obligatoire pour un lead converti")
      )
    }

    if (!this.convertedAt) {
      this.convertedAt = new Date()
    }
  }

  next()
})

const Lead = mongoose.model("Lead", leadSchema)

export default Lead