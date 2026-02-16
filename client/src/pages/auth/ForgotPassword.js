import React, { useState } from "react";
import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import { WaterDrop } from "@mui/icons-material";
import InputType from "../../components/shared/Form/InputType";
import API from "../../services/API";
import { isValidEmail } from "../../utils/validation";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setSubmitting(true);
            const { data } = await API.post("/auth/forgot-password", { email });
            setMessage(data?.message || "If the email exists, a reset link has been sent");
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to send reset link");
        } finally {
            setSubmitting(false);
        }
    };

    return (
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
                    <img src="./assets/images/banner1.jpg" alt="forgotPassword" />
                </div>
                <div className="col-md-4 form-container">
                    <form onSubmit={handleSubmit}>
                        <h1 className="text-center">Forgot Password</h1>
                        <hr />
                        {message && <div className="alert alert-success">{message}</div>}
                        {error && <div className="alert alert-danger">{error}</div>}
                        <InputType
                            labelText={"Email"}
                            labelFor={"forEmail"}
                            inputType={"email"}
                            name={"email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={true}
                        />
                        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                            {submitting ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                </div>
            </div>
        </Box>
    );
};

export default ForgotPassword;
