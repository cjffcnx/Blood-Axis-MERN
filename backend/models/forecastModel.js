/**
 * Forecast Model
 * 
 * Stores metadata about blood demand forecasts.
 * The actual forecast data is stored in the forecasts collection
 * created by the Python module.
 */

const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema(
    {
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        forecastDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['success', 'partial_success', 'failed'],
            default: 'success',
        },
        totalForecasts: {
            type: Number,
            default: 0,
        },
        averageConfidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.7,
        },
        modelTypes: {
            type: [String],
            default: [],
        },
        metadata: {
            daysBack: {
                type: Number,
                default: 180,
            },
            bloodGroupsCovered: {
                type: Number,
                default: 0,
            },
            bloodGroupsWithErrors: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

// Index for faster queries
forecastSchema.index({ organisationId: 1, forecastDate: -1 });
forecastSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Expire after 90 days

module.exports = mongoose.model('Forecast', forecastSchema);
