const mongoose = require("mongoose");

const donorInterestSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    availability: {
      type: Date,
      required: [true, "Availability date is required"],
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"],
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "scheduled", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Indexes for optimization
donorInterestSchema.index({ donor: 1, organisation: 1 });
donorInterestSchema.index({ organisation: 1, status: 1 });

module.exports = mongoose.model("donorInterests", donorInterestSchema);
