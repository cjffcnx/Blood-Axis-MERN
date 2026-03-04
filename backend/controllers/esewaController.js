const axios = require("axios");
const crypto = require("crypto");
const requestModel = require("../models/requestModel");

// Helper to generate signature using HMAC-SHA256 -> Base64
const generateSignature = (secretKey, message) => {
    return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
};

// POST /api/v1/esewa/initiate
// Builds signed payload for eSewa form and returns it to the frontend
const esewaInitiateController = async (req, res) => {
    try {
        const { amount, productName, transactionId } = req.body;

        if (!amount || !productName || !transactionId) {
            return res.status(400).send({ success: false, message: "amount, productName, and transactionId are required" });
        }

        const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
        const SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4000";

        // eSewa required fields
        const total_amount = Number(amount).toFixed(2);
        const product_code = MERCHANT_CODE;
        const transaction_uuid = transactionId;
        const product_service_charge = "0";
        const product_delivery_charge = "0";
        const tax_amount = "0";

        // Message to sign
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const signature = generateSignature(SECRET_KEY, message);

        const payload = {
            amount: total_amount,
            total_amount,
            product_code,
            product_service_charge,
            product_delivery_charge,
            tax_amount,
            transaction_uuid,
            success_url: `${FRONTEND_URL}/payment-success`,
            failure_url: `${FRONTEND_URL}/payment-success`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature,
            product_name: productName,
        };

        return res.status(200).send({ success: true, payload });
    } catch (error) {
        console.error("eSewa initiate error:", error.message);
        return res.status(500).send({ success: false, message: "Error initiating eSewa payment", error: error.message });
    }
};

// POST /api/v1/esewa/verify
// Verifies payment status. Supports:
// 1) Direct transaction UUID/code in body
// 2) Base64-encoded `data` blob returned by eSewa containing status/ids
const esewaVerifyController = async (req, res) => {
    try {
        const {
            transactionId, // legacy name (transaction_uuid)
            transaction_uuid,
            transaction_code,
            total_amount,
            product_code,
            encodedData,
        } = req.body;

        let txnUuid = transaction_uuid || transactionId || null;
        let txnCode = transaction_code || null;
        let amount = total_amount || null;
        let productCode = product_code || process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";

        // If encodedData exists, decode and populate fields
        if (encodedData) {
            try {
                const json = Buffer.from(encodedData, "base64").toString("utf-8");
                const parsed = JSON.parse(json);
                txnUuid = txnUuid || parsed?.transaction_uuid;
                txnCode = txnCode || parsed?.transaction_code;
                amount = amount || parsed?.total_amount;
                productCode = productCode || parsed?.product_code;

                // If eSewa already reports COMPLETE, short-circuit success
                if (parsed?.status && parsed.status.toLowerCase() === "complete") {
                    return res.status(200).send({ success: true, message: "Payment verified", status: "success", data: parsed });
                }
            } catch (err) {
                console.warn("Failed to decode encodedData from eSewa", err?.message || err);
            }
        }

        if (!txnUuid && !txnCode) {
            return res.status(400).send({ success: false, message: "transaction_uuid or transaction_code is required" });
        }

        // Use eSewa v2 transaction status endpoint (RC/UAT)
        const statusUrl = "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

        const payload = {
            product_code: productCode,
            total_amount: amount, // optional but improves validation
            transaction_uuid: txnUuid,
        };

        // Remove undefined values
        Object.keys(payload).forEach((k) => payload[k] === undefined || payload[k] === null ? delete payload[k] : null);

        const response = await axios.post(statusUrl, payload, {
            headers: { "Content-Type": "application/json" },
        });

        const status = response.data?.status;

        if (status && status.toLowerCase() === "complete") {
            return res.status(200).send({ success: true, message: "Payment verified", status: "success", data: response.data });
        }

        return res.status(200).send({ success: false, message: "Payment not completed", status: "failed", data: response.data });
    } catch (error) {
        console.error("eSewa verify error:", error.response?.data || error.message);
        return res.status(500).send({ success: false, message: "Error verifying payment", error: error.response?.data || error.message });
    }
};

module.exports = {
    esewaInitiateController,
    esewaVerifyController,
    generateSignature,
};
