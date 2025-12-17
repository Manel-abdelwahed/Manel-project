import mongoose from "mongoose"

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: String,
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted"],
      default: "new",
    },
    source: String,
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Original fields kept for compatibility
    N: Number,
    nom: String,
    gouvernorat: String,
    region: String,
    telephone: String,
    besoin: String,
    dc: String,
    commercial: String,
    da: String,
    observation: String,
    rappel: String,
    puissance_ch: String,
    prix: String,
    subvention: String,
    modalites_paiement: String,
    contact1: String,
    contact2: String,
    contact3: String,
  },
  {
    timestamps: true,
  },
)

const Client = mongoose.model("Client", clientSchema)

export default Client
