import React, { useState } from "react";
import InputType from "../../components/shared/Form/InputType";
import API from "../../services/API";
import { isValidEmail } from "../../utils/validation";

const ForgotPassword = () => {
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
    );
};

export default ForgotPassword;
