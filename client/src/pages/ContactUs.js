import React, { useState } from "react";
import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import { WaterDrop } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/API";
import Footer from '../components/shared/Footer/Footer';
import "./ContactUs.css";
import { isValidEmail, isValidPhone } from "../utils/validation";

const ContactUs = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!isValidEmail(formData.email)) {
                toast.error("Email not in correct format");
                setLoading(false);
                return;
            }
            if (formData.phone && !isValidPhone(formData.phone)) {
                toast.error("Phone number is not 10 digit");
                setLoading(false);
                return;
            }
            const { data } = await API.post("/contact/send-message", formData);

            if (data?.success) {
                toast.success("Thank you for contacting us! We'll get back to you soon.");
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: ""
                });
            } else {
                toast.error(data?.message || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: "fa-map-marker-alt",
            title: "Visit Us",
            details: ["Kathmandu Blood Bank", "Jorpati, Kathmandu", "Nepal"]
        },
        {
            icon: "fa-phone",
            title: "Call Us",
            details: ["+977-1-5918337", "+977-1-4479637", "Mon-Fri: 6:00 AM - 8:00 PM"]
        },
        {
            icon: "fa-envelope",
            title: "Email Us",
            details: ["gsrijan02@gmail.com", "nishantshah021351@gmail.com", "sahshreeram984@gmail.com"]
        },
        {
            icon: "fa-clock",
            title: "Working Hours",
            details: ["Monday - Friday: 6:00 AM - 8:00 PM", "Saturday: 6:00 AM - 6:00 PM", "Sunday: 8:00 AM - 2:00 PM"]
        }
    ];

    const socialLinks = [
        { icon: "fab fa-facebook-f", link: "#", color: "#3b5998" },
        { icon: "fab fa-twitter", link: "#", color: "#1da1f2" },
        { icon: "fab fa-instagram", link: "#", color: "#e4405f" },
        { icon: "fab fa-linkedin-in", link: "#", color: "#0077b5" }
    ];

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

            <div className="contact-page">
                <div className="container mt-4 mb-5">
                    <div className="contact-header text-center mb-5">
                        <h1 className="contact-title">Get In Touch</h1>
                        <p className="contact-subtitle">
                            Have questions or need assistance? We're here to help. Reach out to us anytime.
                        </p>
                    </div>

                    <div className="row g-4 mb-5">
                        {contactInfo.map((info, index) => (
                            <div className="col-md-6 col-lg-3" key={index}>
                                <div className="contact-info-card h-100">
                                    <div className="icon-wrapper">
                                        <i className={`fas ${info.icon}`}></i>
                                    </div>
                                    <h5 className="info-title">{info.title}</h5>
                                    {info.details.map((detail, i) => (
                                        <p key={i} className="info-detail">{detail}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-7">
                            <div className="contact-form-card">
                                <h3 className="form-title">
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Send Us a Message
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Your Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email Address *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+977-XXXXXXXXXX"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Subject *</label>
                                            <select
                                                className="form-select"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="donation">Blood Donation</option>
                                                <option value="request">Blood Request</option>
                                                <option value="technical">Technical Support</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Message *</label>
                                        <textarea
                                            className="form-control"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="6"
                                            placeholder="Write your message here..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-danger btn-lg w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="map-card mb-4">
                                <h4 className="map-title">
                                    <i className="fas fa-map-marked-alt me-2"></i>
                                    Our Location
                                </h4>
                                <div className="map-container">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.5858932748885!2d85.33695831506194!3d27.735700382793595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197749109843%3A0x39a5ec21e3c87dc6!2sMaharajgunj%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1234567890123!5m2!1sen!2snp"
                                        width="100%"
                                        height="300"
                                        style={{ border: 0, borderRadius: "10px" }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        title="Blood Bank Location"
                                    ></iframe>
                                </div>
                            </div>

                            <div className="emergency-card">
                                <div className="emergency-icon">
                                    <i className="fas fa-ambulance"></i>
                                </div>
                                <h4 className="emergency-title">Emergency?</h4>
                                <p className="emergency-text">
                                    For urgent blood requirements, call our 24/7 emergency hotline
                                </p>
                                <a href="tel:+9779851234567" className="btn btn-light btn-lg w-100">
                                    <i className="fas fa-phone-alt me-2"></i>
                                    +977-9840031714
                                </a>
                            </div>

                            <div className="social-card mt-4">
                                <h5 className="social-title">Follow Us</h5>
                                <div className="social-links">
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.link}
                                            className="social-link"
                                            style={{ backgroundColor: social.color }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className={social.icon}></i>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="faq-link-section text-center mt-5 p-4">
                        <h4 className="mb-3">Looking for quick answers?</h4>
                        <p className="mb-4">Check out our FAQ section for commonly asked questions</p>
                        <a href="/faq" className="btn btn-outline-danger btn-lg">
                            <i className="fas fa-question-circle me-2"></i>
                            View FAQ
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </Box>
    );
};

export default ContactUs;
