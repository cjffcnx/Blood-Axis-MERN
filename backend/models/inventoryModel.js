const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    inventoryType: {
      type: String,
      required: [true, "inventory type require"],
      enum: ["in", "out"],
    },
    bloodGroup: {
      type: String,
      required: [true, "blood group is require"],
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-", "Unknown"],
    },
    quantity: {
      type: Number,
      require: [true, "blood quanity is require"],
    },
    email: {
      type: String,
      required: [true, "Donar Email is Required"],
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "organisation is require"],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: function () {
        return this.inventoryType === "out";
      },
    },
    donar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: function () {
        return this.inventoryType === "in";
      },
    },
    isDisposed: {
      type: Boolean,
      default: false,
    },
    disposedAt: {
      type: Date,
      default: undefined,
    },
    disposalMethod: {
      type: String,
      enum: ["incineration", "biohazard", "autoclave", "chemical", "other"],
      default: undefined,
    },
    isMarkedExpired: {
      type: Boolean,
      default: false,
    },
    expiredAt: {
      type: Date,
      default: undefined,
    },
    expiryReason: {
      type: String,
      trim: true,
      default: undefined,
    },
    expiredFromInterest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "donorInterests",
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
