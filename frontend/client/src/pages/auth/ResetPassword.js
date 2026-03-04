import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputType from "../../components/shared/Form/InputType";
import API from "../../services/API";
import { getPasswordError } from "../../utils/validation";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const passError = getPasswordError(password);
        if (passError) {
            setError(passError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setSubmitting(true);
            const { data } = await API.post("/auth/reset-password", { token, password });
            setMessage(data?.message || "Password reset successfully");
            setTimeout(() => navigate("/login"), 800);
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to reset password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="row g-0">
            <div className="col-md-8 form-banner">
                <img src="/assets/images/banner2.jpg" alt="resetPassword" />
            </div>
            <div className="col-md-4 form-container">
                <form onSubmit={handleSubmit}>
                    <h1 className="text-center">Reset Password</h1>
                    <hr />
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    <InputType
                        labelText={"New Password"}
                        labelFor={"forPassword"}
                        inputType={"password"}
                        name={"password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={true}
                    />
                    <InputType
                        labelText={"Confirm Password"}
                        labelFor={"forConfirmPassword"}
                        inputType={"password"}
                        name={"confirmPassword"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={true}
                    />
                    <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
