const axios = require("axios");
const requestModel = require("../models/requestModel");

// KHALTI INITIATE PAYMENT
const khaltiInitiateController = async (req, res) => {
    try {
        const { amount, purchaseOrderId, purchaseOrderName, bloodGroup, quantity, message, userId } = req.body;

        console.log("Khalti Initiate Request:", req.body);

        // Validation
        if (!amount || !purchaseOrderId || !purchaseOrderName) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields",
            });
        }

        const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "test_secret_key_123";
        const TEST_MODE = process.env.KHALTI_TEST_MODE === "true";

        console.log("Using Khalti Secret Key:", KHALTI_SECRET_KEY.substring(0, 10) + "...");
        console.log("Test Mode:", TEST_MODE);

        // If in test mode, return mock response
        if (TEST_MODE || KHALTI_SECRET_KEY === "test_secret_key_123") {
            console.log("Running in TEST MODE - Returning mock Khalti response");
            const mockPidx = "test_pidx_" + Date.now();
            const mockPaymentUrl = `https://khalti.com/test-payment?pidx=${mockPidx}`;

            return res.status(200).send({
                success: true,
                message: "Payment initiated successfully (TEST MODE)",
                payment_url: mockPaymentUrl,
                pidx: mockPidx,
                data: {
                    pidx: mockPidx,
                    payment_url: mockPaymentUrl
                }
            });
        }

        const data = {
            return_url: `${process.env.FRONTEND_URL || "http://localhost:4000"}/khalti-success`,
            website_url: process.env.FRONTEND_URL || "http://localhost:4000",
            amount: Number(amount) * 100, // Khalti needs amount in paisa
            purchase_order_id: purchaseOrderId,
            purchase_order_name: purchaseOrderName,
            customer_info: {
                name: req.body.name || "Blood Donor",
                email: req.body.email || "donor@mail.com",
                phone: req.body.phone || "9800000000"
            }
        };

        console.log("Khalti Request Data:", data);

        const response = await axios.post(
            "https://a.khalti.com/api/v2/epayment/initiate/",
            data,
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Khalti Success Response:", response.data);

        return res.status(200).send({
            success: true,
            message: "Payment initiated successfully",
            payment_url: response.data.payment_url,
            pidx: response.data.pidx,
            data: response.data
        });
    } catch (error) {
        console.error("Khalti Initiate Error:", error.message);
        console.error("Error Response Data:", error.response?.data);
        console.error("Error Status:", error.response?.status);
        return res.status(500).send({
            success: false,
            message: "Error initiating payment",
            error: error.response?.data || error.message,
            details: error.response?.data?.detail || error.message
        });
    }
};

// KHALTI VERIFY PAYMENT
const khaltiVerifyController = async (req, res) => {
    try {
        const { pidx, bloodGroup, quantity, message, requestData } = req.body;

        if (!pidx) {
            return res.status(400).send({
                success: false,
                message: "Payment ID (pidx) is required",
            });
        }

        const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "test_secret_key_123";

        const response = await axios.post(
            "https://a.khalti.com/api/v2/epayment/lookup/",
            { pidx },
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY}`
                }
            }
        );

        // If payment is successful, create blood request record
        if (response.data.status === "Completed") {
            const bloodRequest = new requestModel({
                name: requestData?.name || "Blood Request",
                phone: requestData?.phone || "N/A",
                email: requestData?.email || "N/A",
                bloodGroup: bloodGroup,
                quantity: quantity,
                message: message,
                status: "approved", // Payment verified, so mark as approved
                attachment: null,
                paymentId: pidx,
                paymentMethod: "khalti",
                paymentStatus: "completed"
            });

            await bloodRequest.save();

            return res.status(200).send({
                success: true,
                message: "Payment verified and blood request created",
                paymentStatus: response.data.status,
                request: bloodRequest,
                khaltiData: response.data
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Payment not completed",
                paymentStatus: response.data.status
            });
        }
    } catch (error) {
        console.log("Khalti Verify Error:", error);
        return res.status(500).send({
            success: false,
            message: "Error verifying payment",
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    khaltiInitiateController,
    khaltiVerifyController
};
