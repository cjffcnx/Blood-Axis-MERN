import React, { useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import InputType from "../../components/shared/Form/InputType";
import API from "../../services/API";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RequestSupply = () => {
    const [bloodGroup, setBloodGroup] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!bloodGroup || !quantity) {
                return toast.error("Please provide valid details!");
            }
            setLoading(true);
            const { data } = await API.post("/request/hospital-request", {
                bloodGroup,
                quantity,
                message,
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

    return (
        <Layout>
            <div className="d-flex flex-column align-items-center justify-content-center mt-4">
                <h1>Request Blood Supply</h1>
                <div className="form-container w-50 card p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Blood Group</label>
                            <select
                                className="form-select"
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
                        <InputType
                            labelText={"Quantity (ML)"}
                            labelFor={"quantity"}
                            inputType={"number"}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                        <div className="mb-3">
                            <label className="form-label">Message (Optional)</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default RequestSupply;
