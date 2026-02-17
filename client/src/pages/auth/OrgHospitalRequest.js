import React, { useState } from "react";
import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import { WaterDrop } from "@mui/icons-material";
import API from "../../services/API";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Spinner from "../../components/shared/Spinner";
import { toast } from "react-toastify";
import { isValidEmail, isValidPassword, getPasswordError, isValidPhone } from "../../utils/validation";

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
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [proofFile, setProofFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const navigate = useNavigate();

    const handleEmailBlur = () => {
        if (email && !isValidEmail(email)) {
            setEmailError("Email not in correct format");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordBlur = () => {
        const error = getPasswordError(password);
        setPasswordError(error);
    };

    const handlePhoneBlur = () => {
        if (!phone) return;
        if (!isValidPhone(phone)) {
            setPhoneError("Phone number is not 10 digit");
        } else {
            setPhoneError("");
        }
    };

    const handleFileChange = (e) => {
        setProofFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate email
            if (!isValidEmail(email)) {
                setEmailError("Email not in correct format");
                toast.error("Email not in correct format");
                return;
            }

            // Validate password
            const passwordErrorMsg = getPasswordError(password);
            if (passwordErrorMsg) {
                setPasswordError(passwordErrorMsg);
                toast.error(passwordErrorMsg);
                return;
            }

            if (!isValidPhone(phone)) {
                setPhoneError("Phone number is not 10 digit");
                toast.error("Phone number is not 10 digit");
                return;
            }

            const parsedLatitude = Number(latitude);
            const parsedLongitude = Number(longitude);
            if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
                toast.error("Latitude must be between -90 and 90");
                return;
            }
            if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
                toast.error("Longitude must be between -180 and 180");
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
            formData.append("latitude", parsedLatitude);
            formData.append("longitude", parsedLongitude);

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
                <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
                    <AppBar position="fixed" color="transparent" elevation={0} sx={{ py: 1, backgroundColor: "white" }}>
                        <Toolbar>
                            <Typography variant="h5" sx={{ flexGrow: 1, color: "#d32f2f", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                                <WaterDrop /> Blood Bank Nepal
                            </Typography>
                            <Link component={RouterLink} to="/" underline="none" sx={{ mx: 2, fontWeight: "medium", color: "text.primary", "&:hover": { color: "error.main" } }}>
                                Home
                            </Link>
                            <Link component={RouterLink} to="/faq" underline="none" sx={{ mx: 2, fontWeight: "medium", color: "text.primary", "&:hover": { color: "error.main" } }}>
                                FAQ
                            </Link>
                            <Link component={RouterLink} to="/contact" underline="none" sx={{ mx: 2, fontWeight: "medium", color: "text.primary", "&:hover": { color: "error.main" } }}>
                                Contact Us
                            </Link>
                            <Link component={RouterLink} to="/request-account" underline="none" sx={{ mx: 2, fontWeight: "medium", color: "text.primary", "&:hover": { color: "error.main" } }}>
                                Register Org/Hospital
                            </Link>
                            <Button variant="contained" color="error" onClick={() => navigate("/login")} sx={{ borderRadius: 5 }}>
                                Login
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Toolbar />
                    <div className="row g-0">
                        <div className="col-md-8 form-banner">
                            <img src="./assets/images/banner2.jpg" alt="requestImage" />
                        </div>

                        <div className="col-md-4 form-container pt-3">
                            <form onSubmit={handleSubmit}>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <h1 className="m-0 fw-bold text-muted text-uppercase" style={{ letterSpacing: "0.5px" }}>
                                        Request Account
                                    </h1>
                                </div>
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
                                        Latitude
                                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="form-control"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Longitude
                                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="form-control"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        required
                                    />
                                </div>

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
                                        className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (isValidPhone(e.target.value)) {
                                                setPhoneError("");
                                            }
                                        }}
                                        onBlur={handlePhoneBlur}
                                        required
                                    />
                                    {phoneError && (
                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                            {phoneError}
                                        </div>
                                    )}
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
                </Box>
            )}
        </>
    );
};

export default OrgHospitalRequest;
