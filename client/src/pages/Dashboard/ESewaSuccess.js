import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import jsPDF from "jspdf";

const ESewaSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("checking");
    const [message, setMessage] = useState("");
    const [creatingRequest, setCreatingRequest] = useState(false);
    const [flowType, setFlowType] = useState("supply");
    const [receiptData, setReceiptData] = useState(null);
    const hasProcessedRef = useRef(false);

    const cleanupAttachment = async (payload) => {
        if (!payload?.attachmentPath) return;
        try {
            await API.post("/request/cleanup-attachment", {
                attachmentPath: payload.attachmentPath,
            });
        } catch (error) {
            console.log("Cleanup error:", error);
        }
    };

    // eSewa can return either a txnId/transaction_uuid query param or a base64-encoded `data` blob.
    const extractTransactionId = () => {
        const directId = searchParams.get("txnId") || searchParams.get("transaction_uuid");
        if (directId) return directId;

        const encoded = searchParams.get("data");
        if (!encoded) return null;

        try {
            const json = atob(encoded);
            const parsed = JSON.parse(json);
            // transaction_uuid is the field we used when initiating the payment
            return parsed?.transaction_uuid || parsed?.transaction_code || null;
        } catch (err) {
            console.warn("Failed to decode eSewa data param", err);
            return null;
        }
    };

    useEffect(() => {
        if (hasProcessedRef.current) {
            return;
        }
        hasProcessedRef.current = true;

        const verifyPayment = async () => {
            const txnId = extractTransactionId();
            const emergencyPayloadRaw = sessionStorage.getItem("pendingEmergencyRequestPayload");
            const supplyPayloadRaw = sessionStorage.getItem("pendingRequestPayload");
            let emergencyPayload = null;

            if (emergencyPayloadRaw) {
                try {
                    emergencyPayload = JSON.parse(emergencyPayloadRaw);
                } catch (err) {
                    emergencyPayload = null;
                }
            }

            if (!txnId) {
                await cleanupAttachment(emergencyPayload);
                if (emergencyPayloadRaw) {
                    sessionStorage.removeItem("pendingEmergencyRequestPayload");
                }
                setStatus("failed");
                setMessage("No transaction ID found in URL");
                return;
            }

            try {
                const response = await axios.post("http://localhost:5000/api/v1/esewa/verify", {
                    transactionId: txnId,
                    encodedData: searchParams.get("data"),
                });

                if (response.data?.success) {
                    setStatus("success");
                    setMessage("Payment verified. Blood request will be created.");

                    if (emergencyPayloadRaw) {
                        setFlowType("emergency");
                        try {
                            const parsedPayload = emergencyPayload || JSON.parse(emergencyPayloadRaw);
                            setCreatingRequest(true);
                            const createRes = await API.post("/request/create-request", {
                                ...parsedPayload,
                                paymentStatus: "paid",
                            });
                            setCreatingRequest(false);
                            if (createRes.data?.success) {
                                setMessage("Payment verified and emergency request submitted successfully.");
                                setReceiptData({
                                    flow: "Emergency",
                                    name: parsedPayload.name,
                                    phone: parsedPayload.phone,
                                    bloodGroup: parsedPayload.bloodGroup,
                                    quantity: parsedPayload.quantity,
                                    hospitalName: parsedPayload.hospitalName,
                                    transactionId: txnId,
                                    paidAt: new Date().toISOString(),
                                });
                                sessionStorage.removeItem("pendingEmergencyRequestPayload");
                            } else {
                                setMessage(createRes.data?.message || "Payment verified but failed to save request");
                            }
                        } catch (err) {
                            setCreatingRequest(false);
                            console.log("Emergency request creation after payment failed", err);
                            setMessage("Payment verified but failed to save request");
                        }
                        return;
                    }

                    if (supplyPayloadRaw) {
                        setFlowType("supply");
                        try {
                            const parsedPayload = JSON.parse(supplyPayloadRaw);
                            setCreatingRequest(true);
                            const createRes = await API.post("/request/hospital-request", {
                                ...parsedPayload,
                                paymentStatus: "paid",
                            });
                            setCreatingRequest(false);
                            if (createRes.data?.success) {
                                setMessage("Payment verified and request submitted to the selected organisation.");
                                setReceiptData({
                                    flow: "Supply",
                                    bloodGroup: parsedPayload.bloodGroup,
                                    quantity: parsedPayload.quantity,
                                    organisationId: parsedPayload.organisationId,
                                    transactionId: txnId,
                                    paidAt: new Date().toISOString(),
                                });
                                sessionStorage.removeItem("pendingRequestPayload");
                            } else {
                                setMessage(createRes.data?.message || "Payment verified but failed to save request");
                            }
                        } catch (err) {
                            setCreatingRequest(false);
                            console.log("Request creation after payment failed", err);
                            setMessage("Payment verified but failed to save request");
                        }
                        return;
                    }

                    setMessage("Payment verified. Please resubmit request if it does not appear.");
                } else {
                    await cleanupAttachment(emergencyPayload);
                    if (emergencyPayloadRaw) {
                        sessionStorage.removeItem("pendingEmergencyRequestPayload");
                    }
                    setStatus("failed");
                    setMessage(response.data?.message || "Payment verification failed");
                }
            } catch (error) {
                console.log("Verification error:", error.response?.data || error.message);
                await cleanupAttachment(emergencyPayload);
                if (emergencyPayloadRaw) {
                    sessionStorage.removeItem("pendingEmergencyRequestPayload");
                }
                setStatus("failed");
                setMessage(error.response?.data?.message || "Error verifying payment");
            }
        };

        verifyPayment();
    }, [searchParams]);

    const downloadReceipt = () => {
        if (!receiptData) return;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Blood Bank Payment Receipt", 20, 20);

        doc.setFontSize(11);
        const lines = [
            `Flow: ${receiptData.flow}`,
            `Transaction ID: ${receiptData.transactionId}`,
            `Paid At: ${receiptData.paidAt}`,
            receiptData.name ? `Name: ${receiptData.name}` : null,
            receiptData.phone ? `Phone: ${receiptData.phone}` : null,
            receiptData.bloodGroup ? `Blood Group: ${receiptData.bloodGroup}` : null,
            receiptData.quantity ? `Quantity: ${receiptData.quantity} ML` : null,
            receiptData.hospitalName ? `Hospital: ${receiptData.hospitalName}` : null,
            receiptData.organisationId ? `Organisation ID: ${receiptData.organisationId}` : null,
        ].filter(Boolean);

        lines.forEach((line, index) => {
            doc.text(line, 20, 35 + index * 8);
        });

        doc.save(`receipt-${receiptData.transactionId || Date.now()}.pdf`);
    };

    return (
        <Layout>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className={`card text-center ${status === "success" ? "border-success" : "border-danger"}`}>
                            <div className="card-body py-5">
                                {status === "checking" && (
                                    <>
                                        <div className="spinner-border text-primary mb-3" role="status"></div>
                                        <h4>Verifying payment...</h4>
                                    </>
                                )}

                                {status === "success" && (
                                    <>
                                        <i className="fa-solid fa-circle-check text-success" style={{ fontSize: 48 }}></i>
                                        <h4 className="mt-3">Payment Successful</h4>
                                        <p className="text-muted">{message}</p>
                                        {receiptData && (
                                            <button className="btn btn-outline-success mt-3" onClick={downloadReceipt}>
                                                Download Receipt
                                            </button>
                                        )}
                                    </>
                                )}

                                {status === "failed" && (
                                    <>
                                        <i className="fa-solid fa-circle-xmark text-danger" style={{ fontSize: 48 }}></i>
                                        <h4 className="mt-3">Payment Failed</h4>
                                        <p className="text-muted">{message}</p>
                                    </>
                                )}

                                <div className="d-grid gap-2 mt-4">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(flowType === "emergency" ? "/" : "/request-supply")}
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate(flowType === "emergency" ? "/" : "/home")}
                                    >
                                        {flowType === "emergency" ? "Home" : "Dashboard"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ESewaSuccess;
