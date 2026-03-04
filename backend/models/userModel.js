const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "role is required"],
      enum: ["admin", "organisation", "donar", "hospital"],
    },
    name: {
      type: String,
      required: function () {
        if (this.role === "user" || this.role === "admin") {
          return true;
        }
        return false;
      },
    },
    organisationName: {
      type: String,
      required: function () {
        if (this.role === "organisation") {
          return true;
        }
        return false;
      },
    },
    hospitalName: {
      type: String,
      required: function () {
        if (this.role === "hospital") {
          return true;
        }
        return false;
      },
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is requied"],
    },
    website: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "address is required"],
    },
    phone: {
      type: String,
      required: [true, "phone numbe is required"],
      trim: true,
      validate: {
        validator: (value) => /^\d{10}$/.test(String(value).trim()),
        message: "Phone number must be exactly 10 digits",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preferredCity: {
      type: String,
      required: function () {
        return this.role === "donar";
      },
    },
    lastEmailUpdate: {
      type: Date,
      default: null,
    },
    lastPhoneUpdate: {
      type: Date,
      default: null,
    },
    resetPasswordTokenHash: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  { timestamps: true }
);

// Indexes for optimization
userSchema.index({ role: 1 });

module.exports = mongoose.model("users", userSchema);
