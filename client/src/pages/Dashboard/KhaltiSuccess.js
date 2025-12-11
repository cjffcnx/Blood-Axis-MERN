import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/shared/Layout/Layout";
import './KhaltiSuccess.css';

const KhaltiSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const pidx = searchParams.get("pidx");
                const purchaseOrderId = searchParams.get("purchase_order_id");

                if (!pidx) {
                    setError("No payment ID found");
                    setLoading(false);
                    return;
                }

                // Verify payment with backend
                const response = await axios.post(
                    "http://localhost:5000/api/v1/khalti/verify",
                    { pidx, purchaseOrderId }
                );

                setPaymentInfo(response.data);
                setLoading(false);

                // Auto redirect after 5 seconds if successful
                if (response.data.success) {
                    setTimeout(() => {
                        navigate("/donation");
                    }, 5000);
                }
            } catch (err) {
                console.log("Error:", err);
                setError(err.response?.data?.message || "Failed to verify payment");
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <Layout>
            <div className="khalti-success-page">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto">
                            {loading ? (
                                <div className="card payment-card loading-card">
                                    <div className="card-body text-center">
                                        <div className="spinner-border text-primary mb-4" role="status">
                                            <span className="visually-hidden">Verifying payment...</span>
                                        </div>
                                        <h4>Verifying Your Payment</h4>
                                        <p className="text-muted">Please wait while we confirm your transaction...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="card payment-card error-card">
                                    <div className="card-body text-center">
                                        <div className="icon-circle error-icon">
                                            <i className="fa-solid fa-circle-xmark"></i>
                                        </div>
                                        <h4 className="text-danger mt-3">Payment Failed</h4>
                                        <p className="text-muted mb-4">{error}</p>
                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate("/donation")}
                                            >
                                                Back to Blood Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : paymentInfo?.success ? (
                                <div className="card payment-card success-card">
                                    <div className="card-body text-center">
                                        <div className="icon-circle success-icon">
                                            <i className="fa-solid fa-check"></i>
                                        </div>
                                        <h4 className="text-success mt-3">Payment Successful!</h4>
                                        <p className="text-muted mb-4">Your blood request has been created successfully</p>

                                        <div className="payment-details">
                                            <div className="detail-row">
                                                <span className="label">Blood Group:</span>
                                                <span className="value">{paymentInfo.request?.bloodGroup}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Quantity:</span>
                                                <span className="value">{paymentInfo.request?.quantity} ML</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Payment ID:</span>
                                                <span className="value text-truncate">{paymentInfo.request?.paymentId}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Status:</span>
                                                <span className="value">
                                                    <span className="badge bg-success">{paymentInfo.paymentStatus}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="alert alert-info mt-4" role="alert">
                                            <i className="fa-solid fa-info-circle me-2"></i>
                                            Redirecting to blood requests page in <strong>5 seconds</strong>...
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate("/donation")}
                                            >
                                                Go to Blood Requests Now
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate("/donor-dashboard")}
                                            >
                                                Go to Dashboard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card payment-card error-card">
                                    <div className="card-body text-center">
                                        <div className="icon-circle error-icon">
                                            <i className="fa-solid fa-exclamation-triangle"></i>
                                        </div>
                                        <h4 className="text-warning mt-3">Payment Status Unknown</h4>
                                        <p className="text-muted mb-4">Could not verify payment status</p>
                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate("/donation")}
                                            >
                                                Back to Blood Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default KhaltiSuccess;
