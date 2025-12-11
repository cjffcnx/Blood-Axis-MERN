import React, { useState, useEffect } from "react";
import Layout from "../../components/shared/Layout/Layout";
import InputType from "../../components/shared/Form/InputType";
import API from "../../services/API";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./RequestSupply.css";

const RequestSupply = () => {
    const [bloodGroup, setBloodGroup] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [message, setMessage] = useState("");
    const [organisationId, setOrganisationId] = useState("");
    const [organisations, setOrganisations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const { data } = await API.get("/request/organisations");
                if (data?.success) {
                    setOrganisations(data.organisations || []);
                }
            } catch (err) {
                console.log(err);
                toast.error("Unable to load organisations");
            }
        };
        fetchOrgs();
    }, []);

    const BLOOD_RATE = 500; // Rate per ML in NPR

    const calculateAmount = () => {
        return Number(quantity) * BLOOD_RATE;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!bloodGroup || !quantity) {
                return toast.error("Please provide valid details!");
            }
            if (!organisationId) {
                return toast.error("Please select an organisation");
            }
            setLoading(true);
            const { data } = await API.post("/request/hospital-request", {
                bloodGroup,
                quantity,
                message,
                organisationId,
                paymentStatus: "non-paid",
            });
            setLoading(false);
            if (data?.success) {
                toast.success(data.message);
                navigate("/org-list"); // Redirect to Org List or Dashboard
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!bloodGroup || !quantity) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!organisationId) {
            toast.error("Please select an organisation");
            return;
        }

        if (Number(quantity) <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        setPaymentLoading(true);

        try {
            const amount = calculateAmount();
            const transactionId = "REQ-SUPPLY-" + Date.now();
            const productName = `Blood Supply Request - ${bloodGroup}`;

            // Persist request data for post-payment creation
            sessionStorage.setItem(
                "pendingRequestPayload",
                JSON.stringify({ bloodGroup, quantity, message, organisationId })
            );

            const response = await axios.post("http://localhost:5000/api/v1/esewa/initiate", {
                amount,
                productName,
                transactionId,
                bloodGroup,
                quantity,
                message,
            });

            if (response.data?.success && response.data?.payload) {
                const payload = response.data.payload;
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

                Object.entries(payload).forEach(([key, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                toast.error("Could not initiate eSewa payment");
            }
        } catch (err) {
            console.log("Error:", err);
            console.log("Error Response:", err.response?.data);
            toast.error(err.response?.data?.message || err.response?.data?.error || "eSewa payment error");
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <Layout>
            <div className="request-supply-page">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 mx-auto">
                            <div className="card shadow-lg request-card">
                                <div className="card-header bg-primary text-white">
                                    <h2 className="mb-0">Request Blood Supply</h2>
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
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold">
                                                Select Organisation <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={organisationId}
                                                onChange={(e) => setOrganisationId(e.target.value)}
                                                required
                                            >
                                                <option value="">Choose an organisation</option>
                                                {organisations.map((org) => (
                                                    <option key={org._id} value={org._id}>
                                                        {org.organisationName || org.name}
                                                    </option>
                                                ))}
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
                                            <label className="form-label fw-bold">Message (Optional)</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Add any special notes or requirements"
                                            ></textarea>
                                        </div>

                                        {/* Price Summary */}
                                        {quantity > 0 && (
                                            <div className="card bg-light mb-4 price-summary">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p className="mb-2">
                                                                <strong>Quantity:</strong> {quantity} ML
                                                            </p>
                                                            <p className="mb-0">
                                                                <strong>Rate:</strong> NPR {BLOOD_RATE}/ML
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 text-end">
                                                            <h5 className="mb-0">
                                                                <strong>Total: NPR {calculateAmount()}</strong>
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </div>
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
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-paper-plane me-2"></i>
                                                        Submit Request
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-success btn-lg flex-grow-1"
                                                onClick={handlePayment}
                                                disabled={paymentLoading || !quantity}
                                            >
                                                {paymentLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-wallet me-2"></i>
                                                        Pay with eSewa
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-center mt-3 text-muted small">
                                            <i className="fa-solid fa-info-circle me-1"></i>
                                            Submit without payment or use "Pay with eSewa" for immediate processing
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RequestSupply;
