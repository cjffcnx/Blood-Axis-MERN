import React, { useState } from "react";
import API from "../../services/API";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../components/shared/Spinner";
import { toast } from "react-toastify";
import { isValidEmail, isValidPassword, getPasswordError } from "../../utils/validation";

const OrgHospitalRequest = () => {
    const [role, setRole] = useState("organisation");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [website, setWebsite] = useState("");
    const [organisationName, setOrganisationName] = useState("");
    const [hospitalName, setHospitalName] = useState("");
    const [proofFile, setProofFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    const handleEmailBlur = () => {
        if (email && !isValidEmail(email)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordBlur = () => {
        const error = getPasswordError(password);
        setPasswordError(error);
    };

    const handleFileChange = (e) => {
        setProofFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate email
            if (!isValidEmail(email)) {
                setEmailError("Please enter a valid email address");
                toast.error("Please enter a valid email address");
                return;
            }

            // Validate password
            const passwordErrorMsg = getPasswordError(password);
            if (passwordErrorMsg) {
                setPasswordError(passwordErrorMsg);
                toast.error(passwordErrorMsg);
                return;
            }

            if (!proofFile) {
                return toast.error("Please upload a proof document");
            }
            setLoading(true);
            const formData = new FormData();
            formData.append("role", role);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("phone", phone);
            formData.append("address", address);
            formData.append("website", website);
            formData.append("proofFile", proofFile);

            if (role === "organisation") {
                formData.append("organisationName", organisationName);
            } else {
                formData.append("hospitalName", hospitalName);
            }

            const { data } = await API.post("/account-requests/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setLoading(false);
            if (data.success) {
                toast.success(data.message);
                navigate("/login");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <>
            {loading ? (
                <Spinner />
            ) : (
                <div className="row g-0">
                    <div className="col-md-8 form-banner">
                        <img src="./assets/images/banner2.jpg" alt="requestImage" />
                    </div>
                    <div className="col-md-4 form-container">
                        <form onSubmit={handleSubmit}>
                            <h1 className="text-center">Request Account</h1>
                            <hr />
                            <div className="d-flex mb-3">
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        name="role"
                                        value="organisation"
                                        checked={role === "organisation"}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                    <label className="form-check-label">Organisation</label>
                                </div>
                                <div className="form-check ms-3">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        name="role"
                                        value="hospital"
                                        checked={role === "hospital"}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                    <label className="form-check-label">Hospital</label>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Contact Person Name
                                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {role === "organisation" ? (
                                <div className="mb-3">
                                    <label className="form-label">
                                        Organisation Name
                                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={organisationName}
                                        onChange={(e) => setOrganisationName(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <label className="form-label">
                                        Hospital Name
                                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label">
                                    Email
                                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError("");
                                    }}
                                    onBlur={handleEmailBlur}
                                    required
                                />
                                {emailError && (
                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                        {emailError}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Password
                                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError("");
                                    }}
                                    onBlur={handlePasswordBlur}
                                    required
                                />
                                {passwordError && (
                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                        {passwordError}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Phone
                                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Address
                                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Website</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Proof Document (PDF/Image)
                                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>

                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="termsRequest"
                                    required
                                />
                                <label className="form-check-label" htmlFor="termsRequest">
                                    I agree to the <Link to="/terms">Terms and Conditions</Link> &{" "}
                                    <Link to="/privacy">Privacy Policy</Link>
                                </label>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <Link to="/login">Already have an account? Login</Link>
                                <button type="submit" className="btn btn-primary">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrgHospitalRequest;
