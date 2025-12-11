import React, { useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector } from "react-redux";
import './BloodPaymentRequest.css';

const BloodPaymentRequest = () => {
    const { user } = useSelector((state) => state.auth);
    const [bloodGroup, setBloodGroup] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const BLOOD_RATE = 500; // Rate per ML in NPR

    const calculateAmount = () => {
        return Number(quantity) * BLOOD_RATE;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!bloodGroup || !quantity) {
            setError("Blood group and quantity are required");
            toast.error("Please fill all required fields");
            return;
        }

        if (Number(quantity) <= 0) {
            setError("Quantity must be greater than 0");
            toast.error("Invalid quantity");
            return;
        }

        setLoading(true);

        try {
            const amount = calculateAmount();
            const purchaseOrderId = "BLOOD-REQ-" + Date.now();
            const purchaseOrderName = `Blood Request - ${bloodGroup}`;

            // Initiate payment with Khalti
            const response = await axios.post("http://localhost:5000/api/v1/khalti/initiate", {
                amount,
                purchaseOrderId,
                purchaseOrderName,
                bloodGroup,
                quantity,
                message,
                name: user?.name || "Blood Request",
                email: user?.email || "donor@mail.com",
                phone: user?.phone || "9800000000"
            });

            if (response.data.success && response.data.payment_url) {
                // Redirect to Khalti payment page
                window.location.href = response.data.payment_url;
            } else {
                setError("Could not initiate payment");
                toast.error("Payment initiation failed");
            }
        } catch (err) {
            console.log("Error:", err);
            setError("Could not process payment request");
            toast.error(err.response?.data?.message || "Payment error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="blood-payment-page">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 mx-auto">
                            <div className="card shadow-lg">
                                <div className="card-header bg-primary text-white">
                                    <h3 className="mb-0">Request Blood with Payment</h3>
                                </div>
                                <div className="card-body p-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">
                                                Blood Group <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={bloodGroup}
                                                onChange={(e) => setBloodGroup(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Blood Group</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold">
                                                Quantity (ML) <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <div className="input-group input-group-lg">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    placeholder="Enter quantity in ML"
                                                    min="1"
                                                    required
                                                />
                                                <span className="input-group-text">ML</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Message</label>
                                            <textarea
                                                className="form-control"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Add any special notes or requirements"
                                                rows="3"
                                            />
                                        </div>

                                        {/* Price Summary */}
                                        <div className="card bg-light mb-4">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <p className="mb-2">
                                                            <strong>Quantity:</strong> {quantity || 0} ML
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Rate:</strong> NPR {BLOOD_RATE}/ML
                                                        </p>
                                                    </div>
                                                    <div className="col-md-6 text-end">
                                                        <h5 className="mb-0">
                                                            <strong>Total: NPR {calculateAmount() || 0}</strong>
                                                        </h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <div className="d-flex gap-3">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg flex-grow-1"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-brands fa-cc-stripe me-2"></i>
                                                        Pay with Khalti
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-center mt-3 text-muted small">
                                            <i className="fa-solid fa-lock me-1"></i>
                                            Your payment is secure and encrypted with Khalti
                                        </p>
                                    </form>
                                </div>
                            </div>

                            <div className="card mt-4">
                                <div className="card-header bg-info text-white">
                                    <h5 className="mb-0">How it Works</h5>
                                </div>
                                <div className="card-body">
                                    <ol>
                                        <li>Select your required blood group and quantity</li>
                                        <li>Review the total amount to be paid</li>
                                        <li>Click "Pay with Khalti" button</li>
                                        <li>Complete the payment on Khalti's secure platform</li>
                                        <li>Your blood request will be created after payment verification</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BloodPaymentRequest;
