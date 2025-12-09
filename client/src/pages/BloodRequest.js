import React, { useState } from "react";
import API from "../services/API";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const BloodRequest = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [quantity, setQuantity] = useState("");
    const [hospitalName, setHospitalName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post("/request/create-request", {
                name,
                email,
                phone,
                bloodGroup,
                quantity,
                hospitalName,
                message,
            });
            if (data?.success) {
                toast.success(data.message);
                // Clear form
                setName("");
                setEmail("");
                setPhone("");
                setBloodGroup("");
                setQuantity("");
                setHospitalName("");
                setMessage("");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="container-fluid min-vh-100 bg-light d-flex flex-column">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100 mb-4">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">Blood Bank App</Link>
                </div>
            </nav>

            <div className="row justify-content-center flex-grow-1">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow mb-5">
                        <div className="card-header bg-danger text-white">
                            <h3 className="mb-0 text-center">Request Blood</h3>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Blood Group</label>
                                        <select
                                            className="form-select"
                                            value={bloodGroup}
                                            onChange={(e) => setBloodGroup(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Group</option>
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
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Quantity (ML)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Hospital Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-danger">
                                        Submit Request
                                    </button>
                                    <Link to="/" className="btn btn-secondary">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodRequest;
