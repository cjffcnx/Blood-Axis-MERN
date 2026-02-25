import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../services/API";
import "./Footer.css";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Show/hide back to top button based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.pageYOffset > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Newsletter subscription handler
    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setSubscribing(true);

        try {
            const { data } = await API.post("/contact/send-message", {
                name: "Newsletter Subscriber",
                email: email,
                phone: "",
                subject: "Newsletter Subscription",
                message: `Email: ${email}\n\nI would like to receive notifications about blood donation campaigns, updates, and recent news.`,
            });
            if (data?.success) {
                toast.success("Successfully subscribed to newsletter!");
                setEmail("");
            } else {
                toast.error(data?.message || "Failed to subscribe. Please try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setSubscribing(false);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="footer">
                {/* Emergency Banner */}
                <div className="emergency-banner">
                    <div className="container">
                        <div className="emergency-content">
                            <div className="emergency-icon">
                                <i className="fas fa-ambulance pulse-animation"></i>
                            </div>
                            <div className="emergency-text">
                                <h3>24/7 Emergency Blood Request</h3>
                                <p>Immediate assistance available round the clock</p>
                            </div>
                            <a href="tel:+977-985-123-4567" className="emergency-hotline">
                                <i className="fas fa-phone-alt me-2"></i>
                                +977-9840031714
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="footer-main">
                    <div className="container">
                        <div className="footer-grid">
                            {/* About & Branding */}
                            <div className="footer-column">
                                <div className="footer-brand">
                                    <div className="footer-logo">
                                        <i className="fas fa-heartbeat"></i>
                                        <span>Blood Bank Nepal</span>
                                    </div>
                                    <p className="footer-mission">
                                        Connecting donors with those in need. We're dedicated to saving lives
                                        through efficient blood donation management and emergency response services
                                        across Nepal.
                                    </p>
                                    <div className="social-icons">
                                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                            <i className="fab fa-facebook-f"></i>
                                        </a>
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                            <i className="fab fa-twitter"></i>
                                        </a>
                                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                            <i className="fab fa-instagram"></i>
                                        </a>
                                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                            <i className="fab fa-linkedin-in"></i>
                                        </a>
                                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                                            <i className="fab fa-youtube"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Newsletter Section */}
                            <div className="footer-column">
                                <div className="newsletter-section">
                                    <h4 className="newsletter-heading">Stay Updated</h4>
                                    <p className="newsletter-description">
                                        Subscribe to receive notifications about blood donation campaigns, updates, and recent news.
                                    </p>
                                    <form onSubmit={handleSubscribe} className="newsletter-form">
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={subscribing}
                                            required
                                        />
                                        <button type="submit" disabled={subscribing}>
                                            {subscribing ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane"></i>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="container">
                        <div className="footer-bottom-content">
                            <div className="copyright">
                                <p>&copy; {currentYear} Blood Bank Management System. All rights reserved.</p>
                            </div>
                            <div className="legal-links">
                                <Link to="/terms">Terms</Link>
                                <span>|</span>
                                <Link to="/privacy">Privacy</Link>
                            </div>
                            <div className="developer-credit">
                                <p>Developed with <i className="fas fa-heart"></i> for saving lives</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    className="back-to-top"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                >
                    <i className="fas fa-chevron-up"></i>
                </button>
            )}
        </>
    );
};

export default Footer;
