const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    userName: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
    userRole: {
      type: String,
      enum: ["donar", "organisation", "hospital", "admin", "anonymous"],
      default: "anonymous",
    },
    query: {
      type: String,
      required: [true, "query is required"],
      trim: true,
    },
    response: {
      type: String,
      required: [true, "response is required"],
      trim: true,
    },
    queryType: {
      type: String,
      enum: ["text", "voice"],
      default: "text",
    },
    sessionId: {
      type: String,
      required: [true, "sessionId is required"],
      trim: true,
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      responseTime: {
        type: Number,
        default: 0,
      },
      similarChunksCount: {
        type: Number,
        default: 0,
      },
      modelUsed: {
        type: String,
        default: "hf-rag-chatbot",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

// Indexes for performance
chatHistorySchema.index({ userId: 1 });
chatHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("chat_history", chatHistorySchema);
