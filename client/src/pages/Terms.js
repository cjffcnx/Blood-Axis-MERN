import React, { useState } from "react";
import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import { WaterDrop } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Footer from '../components/shared/Footer/Footer';
import "./Terms.css";

const Terms = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    const toggleSection = (index) => {
        setActiveSection(activeSection === index ? null : index);
    };

    const handleAccept = () => {
        if (agreed) {
            localStorage.setItem("termsAccepted", "true");
            navigate("/register");
        }
    };

    const termsContent = [
        {
            id: 1,
            icon: "fa-handshake",
            title: "Introduction & Acceptance of Terms",
            content: `
                <p>Welcome to the Blood Bank Management System ("the Platform"). These Terms and Conditions ("Terms") govern your access to and use of our services, including blood donation scheduling, blood request processing, and related features.</p>
                
                <p><strong>By accessing or using this Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.</strong> If you do not agree with any part of these Terms, you must discontinue use of the Platform immediately.</p>
                
                <p>These Terms constitute a legally binding agreement between you ("User," "Donor," "Hospital," or "Organization") and Blood Bank Management System. Your continued use of the Platform signifies your ongoing acceptance of these Terms and any future modifications.</p>
                
                <div class="important-note">
                    <i class="fas fa-info-circle"></i>
                    <strong>Important:</strong> If you are registering as a Hospital or Organization, additional verification and compliance requirements apply as outlined in Section 3.
                </div>
            `
        },
        {
            id: 2,
            icon: "fa-user-check",
            title: "Donor Eligibility Criteria",
            content: `
                <p>To ensure the safety of both donors and recipients, all blood donors must meet the following eligibility requirements:</p>
                
                <h4>Age & Weight Requirements</h4>
                <ul>
                    <li>Must be between 18 and 65 years of age</li>
                    <li>Minimum weight of 50 kg (110 lbs)</li>
                    <li>Minors (16-17 years) may donate with parental consent and medical approval</li>
                </ul>
                
                <h4>Health Requirements</h4>
                <ul>
                    <li>Generally good health with no active infections</li>
                    <li>Hemoglobin levels: Minimum 12.5 g/dL for women, 13.0 g/dL for men</li>
                    <li>Blood pressure within normal range (90/60 to 140/90 mmHg)</li>
                    <li>Pulse rate between 50-100 beats per minute</li>
                    <li>Body temperature not exceeding 37.5°C (99.5°F)</li>
                </ul>
                
                <h4>Deferral Conditions</h4>
                <p>You are temporarily or permanently deferred from donating if you:</p>
                <ul>
                    <li>Have donated blood within the last 56 days (8 weeks)</li>
                    <li>Are pregnant, breastfeeding, or had a miscarriage within the last 6 months</li>
                    <li>Recently received a tattoo, piercing, or acupuncture (6-month waiting period)</li>
                    <li>Have undergone major surgery within the last 6 months</li>
                    <li>Have traveled to malaria-endemic areas within the last 3 months</li>
                    <li>Have been diagnosed with HIV, Hepatitis B/C, or other blood-borne diseases</li>
                    <li>Have active COVID-19 symptoms or tested positive within the last 14 days</li>
                    <li>Are taking certain medications (consult our medical staff)</li>
                    <li>Have a history of drug abuse or high-risk behavior</li>
                </ul>
                
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Important:</strong> Providing false health information is a serious offense and may endanger recipients. All information is treated confidentially and used solely for safety screening.
                </div>
            `
        },
        {
            id: 3,
            icon: "fa-clipboard-list",
            title: "Donor Responsibilities & Obligations",
            content: `
                <p>As a registered donor on our Platform, you agree to the following responsibilities:</p>
                
                <h4>Accurate Information</h4>
                <ul>
                    <li>Provide truthful and complete health history information</li>
                    <li>Disclose all medical conditions, medications, and lifestyle factors</li>
                    <li>Update your profile promptly if your health status changes</li>
                    <li>Notify us immediately of any post-donation complications</li>
                </ul>
                
                <h4>Pre-Donation Guidelines</h4>
                <ul>
                    <li>Get adequate sleep (at least 6-8 hours) before donation</li>
                    <li>Eat a healthy, iron-rich meal 2-3 hours before donating</li>
                    <li>Drink plenty of water (at least 500ml) before donation</li>
                    <li>Avoid fatty foods 24 hours before donation</li>
                    <li>Do not consume alcohol 24 hours before donation</li>
                    <li>Bring a valid government-issued photo ID</li>
                </ul>
                
                <h4>Post-Donation Care</h4>
                <ul>
                    <li>Rest for 10-15 minutes after donation</li>
                    <li>Consume provided refreshments</li>
                    <li>Avoid strenuous exercise for 24 hours</li>
                    <li>Keep the bandage on for at least 4 hours</li>
                    <li>Drink extra fluids for the next 24-48 hours</li>
                    <li>Report any adverse reactions immediately</li>
                </ul>
                
                <h4>Appointment Commitment</h4>
                <ul>
                    <li>Arrive on time for scheduled appointments</li>
                    <li>Provide at least 24 hours notice if cancellation is necessary</li>
                    <li>Respect blood bank staff and other donors</li>
                    <li>Follow all safety protocols and instructions</li>
                </ul>
                
                <div class="info-box">
                    <i class="fas fa-heart"></i>
                    <strong>Thank You:</strong> Your commitment to these responsibilities helps save lives and ensures the safety of all participants in the donation process.
                </div>
            `
        },
        {
            id: 4,
            icon: "fa-shield-alt",
            title: "Privacy & Data Protection",
            content: `
                <p>We are committed to protecting your personal and health information in compliance with applicable data protection laws and healthcare regulations.</p>
                
                <h4>Information We Collect</h4>
                <ul>
                    <li><strong>Personal Information:</strong> Name, date of birth, address, phone number, email, blood type</li>
                    <li><strong>Health Information:</strong> Medical history, screening results, hemoglobin levels, blood pressure</li>
                    <li><strong>Donation Records:</strong> Donation dates, quantities, locations, test results</li>
                    <li><strong>Usage Data:</strong> Login times, IP addresses, device information, browsing patterns</li>
                </ul>
                
                <h4>How We Use Your Information</h4>
                <ul>
                    <li>To verify donor eligibility and ensure blood safety</li>
                    <li>To schedule and manage donation appointments</li>
                    <li>To conduct required medical screening and testing</li>
                    <li>To maintain accurate donation records and history</li>
                    <li>To communicate appointment reminders and urgent blood needs</li>
                    <li>To generate certificates and receipts</li>
                    <li>To comply with legal and regulatory requirements</li>
                    <li>To improve our services and user experience</li>
                </ul>
                
                <h4>Data Security Measures</h4>
                <ul>
                    <li>End-to-end encryption for data transmission</li>
                    <li>Secure, password-protected databases</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Restricted access to personal data (authorized personnel only)</li>
                    <li>Regular data backups and disaster recovery protocols</li>
                    <li>Compliance with healthcare data protection standards</li>
                </ul>
                
                <h4>Data Sharing</h4>
                <p>We do not sell or rent your personal information. We may share data only in the following circumstances:</p>
                <ul>
                    <li>With authorized hospitals and healthcare facilities for blood transfusion purposes</li>
                    <li>With regulatory authorities as required by law</li>
                    <li>With medical laboratories for blood testing and screening</li>
                    <li>With emergency services in urgent medical situations</li>
                    <li>With your explicit consent for research purposes (anonymized data)</li>
                </ul>
                
                <h4>Your Rights</h4>
                <ul>
                    <li>Access and review your personal information</li>
                    <li>Request corrections to inaccurate data</li>
                    <li>Request deletion of your account (subject to legal retention requirements)</li>
                    <li>Opt-out of non-essential communications</li>
                    <li>Request a copy of your data in portable format</li>
                    <li>File a complaint with data protection authorities</li>
                </ul>
                
                <h4>Data Retention</h4>
                <p>We retain your information for as long as necessary to provide services and comply with legal obligations. Medical records are retained for a minimum of 10 years as required by healthcare regulations.</p>
                
                <div class="privacy-notice">
                    <i class="fas fa-lock"></i>
                    <strong>Privacy Commitment:</strong> Your privacy is our priority. For detailed information, please review our <a href="/privacy">Privacy Policy</a>.
                </div>
            `
        },
        {
            id: 5,
            icon: "fa-hospital",
            title: "Blood Request & Hospital Services",
            content: `
                <p>This section outlines the terms for requesting blood through our Platform.</p>
                
                <h4>Request Eligibility</h4>
                <ul>
                    <li>Only registered hospitals, authorized clinics, and verified organizations may request blood</li>
                    <li>Individual requests must include valid medical documentation</li>
                    <li>Emergency requests are prioritized based on urgency and availability</li>
                    <li>All requests are subject to blood type compatibility verification</li>
                </ul>
                
                <h4>Request Process</h4>
                <ul>
                    <li>Submit request through the online portal with complete patient information</li>
                    <li>Include medical prescription or doctor's recommendation</li>
                    <li>Specify blood type, quantity, and urgency level</li>
                    <li>Provide hospital/clinic registration details</li>
                    <li>Agree to pick up or receive delivery within specified timeframe</li>
                </ul>
                
                <h4>Pricing & Payment</h4>
                <ul>
                    <li>Blood processing and handling fee: NPR 400 per unit</li>
                    <li>Payment accepted via online banking, eSewa, Khalti, or on-site</li>
                    <li>Receipts provided for all transactions</li>
                    <li>Refund policy applies only in cases of order cancellation or unavailability</li>
                    <li>Additional charges may apply for urgent delivery or transportation</li>
                </ul>
                
                <h4>Fulfillment & Delivery</h4>
                <ul>
                    <li>Standard requests fulfilled within 24-48 hours (subject to availability)</li>
                    <li>Emergency requests prioritized and processed immediately when possible</li>
                    <li>Blood transportation follows cold chain management protocols</li>
                    <li>Delivery to registered hospitals and medical facilities only</li>
                </ul>
                
                <h4>Quality Assurance</h4>
                <ul>
                    <li>All blood units undergo mandatory screening for infectious diseases</li>
                    <li>Blood typing and cross-matching performed by certified technicians</li>
                    <li>Temperature-controlled storage and transportation</li>
                    <li>Quality certificates provided with each unit</li>
                </ul>
                
                <div class="important-note">
                    <i class="fas fa-ambulance"></i>
                    <strong>Emergency Note:</strong> For life-threatening emergencies, call our 24/7 hotline at +977-985-123-4567
                </div>
            `
        },
        {
            id: 6,
            icon: "fa-exclamation-circle",
            title: "Limitation of Liability & Disclaimer",
            content: `
                <p>By using this Platform, you acknowledge and agree to the following limitations:</p>
                
                <h4>Medical Disclaimer</h4>
                <ul>
                    <li>This Platform is for appointment scheduling and blood request management only</li>
                    <li>We do not provide medical advice, diagnosis, or treatment</li>
                    <li>Always consult qualified healthcare professionals for medical decisions</li>
                    <li>Information on this Platform does not replace professional medical consultation</li>
                    <li>In case of medical emergency, call emergency services immediately (dial 102/103)</li>
                </ul>
                
                <h4>Safety & Screening</h4>
                <ul>
                    <li>We follow industry-standard blood screening protocols and safety measures</li>
                    <li>Despite rigorous testing, no screening process is 100% foolproof</li>
                    <li>We are not liable for undetectable infections during the window period</li>
                    <li>All donors and recipients assume inherent risks associated with blood donation/transfusion</li>
                </ul>
                
                <h4>Liability Limitations</h4>
                <p>To the maximum extent permitted by law, Blood Bank Management System shall not be liable for:</p>
                <ul>
                    <li>Adverse reactions or side effects from blood donation or transfusion</li>
                    <li>Delays in blood availability due to supply shortages</li>
                    <li>Technical errors, system downtime, or data loss</li>
                    <li>Unauthorized access to your account due to compromised credentials</li>
                    <li>Inaccurate information provided by users</li>
                    <li>Third-party actions or omissions</li>
                    <li>Indirect, consequential, or punitive damages</li>
                </ul>
                
                <h4>Indemnification</h4>
                <p>You agree to indemnify and hold harmless Blood Bank Management System, its employees, and partners from any claims, damages, or expenses arising from:</p>
                <ul>
                    <li>Your violation of these Terms</li>
                    <li>Providing false or misleading information</li>
                    <li>Your negligence or willful misconduct</li>
                    <li>Violation of any third-party rights</li>
                </ul>
                
                <h4>Force Majeure</h4>
                <p>We are not responsible for failure to perform obligations due to circumstances beyond our reasonable control, including natural disasters, pandemics, government actions, war, strikes, or technical failures.</p>
                
                <div class="warning-box">
                    <i class="fas fa-balance-scale"></i>
                    <strong>Legal Notice:</strong> These limitations apply to the fullest extent permitted under applicable law. Some jurisdictions do not allow certain limitations, so portions may not apply to you.
                </div>
            `
        },
        {
            id: 7,
            icon: "fa-user-lock",
            title: "Account Security & Responsibilities",
            content: `
                <h4>Account Creation</h4>
                <ul>
                    <li>You must provide accurate and complete registration information</li>
                    <li>One account per person/organization is permitted</li>
                    <li>You must be 18 years or older to create an account</li>
                    <li>Hospital and organization accounts require verification and approval</li>
                </ul>
                
                <h4>Account Security</h4>
                <ul>
                    <li>You are responsible for maintaining the confidentiality of your password</li>
                    <li>Use strong passwords combining letters, numbers, and special characters</li>
                    <li>Do not share your login credentials with anyone</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Log out from shared or public computers</li>
                </ul>
                
                <h4>Prohibited Activities</h4>
                <p>You agree not to:</p>
                <ul>
                    <li>Create multiple or fake accounts</li>
                    <li>Impersonate others or provide false information</li>
                    <li>Use the Platform for illegal or fraudulent purposes</li>
                    <li>Attempt to hack, breach security, or access unauthorized data</li>
                    <li>Upload malware, viruses, or harmful code</li>
                    <li>Scrape, copy, or automate access to Platform data</li>
                    <li>Harass, threaten, or abuse other users or staff</li>
                    <li>Sell or transfer your account to others</li>
                </ul>
                
                <h4>Account Termination</h4>
                <ul>
                    <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
                    <li>You may delete your account at any time (subject to data retention requirements)</li>
                    <li>Termination does not relieve you of obligations incurred before termination</li>
                </ul>
            `
        },
        {
            id: 8,
            icon: "fa-sync-alt",
            title: "Modification of Terms",
            content: `
                <h4>Right to Modify</h4>
                <p>Blood Bank Management System reserves the right to modify, update, or change these Terms at any time without prior notice. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>
                
                <h4>Notification of Changes</h4>
                <ul>
                    <li>Material changes will be communicated via email or Platform notification</li>
                    <li>Updated Terms will include the "Last Updated" date at the top</li>
                    <li>We encourage you to review these Terms periodically</li>
                </ul>
                
                <h4>Rejection of Changes</h4>
                <p>If you do not agree with modified Terms, you must discontinue use of the Platform. Continued use signifies acceptance.</p>
                
                <div class="info-box">
                    <i class="fas fa-bell"></i>
                    <strong>Stay Informed:</strong> Check this page regularly for updates. Significant changes will be highlighted.
                </div>
            `
        },
        {
            id: 9,
            icon: "fa-gavel",
            title: "Governing Law & Dispute Resolution",
            content: `
                <h4>Governing Law</h4>
                <p>These Terms shall be governed by and construed in accordance with the laws of Nepal, without regard to conflict of law principles.</p>
                
                <h4>Jurisdiction</h4>
                <p>Any disputes arising from these Terms or use of the Platform shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.</p>
                
                <h4>Dispute Resolution</h4>
                <ul>
                    <li>In the event of a dispute, parties agree to first attempt resolution through good-faith negotiation</li>
                    <li>If negotiation fails, disputes may be submitted to mediation before legal action</li>
                    <li>Each party bears its own legal costs unless otherwise determined by the court</li>
                </ul>
                
                <h4>Severability</h4>
                <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            `
        },
        {
            id: 10,
            icon: "fa-phone-alt",
            title: "Contact Information",
            content: `
                <p>If you have questions, concerns, or need assistance regarding these Terms, please contact us:</p>
                
                <div class="contact-details">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <strong>Email:</strong><br>
                            legal@bloodbank.com<br>
                            support@bloodbank.com
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>Phone:</strong><br>
                            +977-1-4412303<br>
                            +977-1-4410911
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Address:</strong><br>
                            Kathmandu Blood Bank<br>
                            Maharajgunj, Kathmandu<br>
                            Nepal
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Business Hours:</strong><br>
                            Monday - Friday: 6:00 AM - 8:00 PM<br>
                            Saturday: 6:00 AM - 6:00 PM<br>
                            Sunday: 8:00 AM - 2:00 PM
                        </div>
                    </div>
                </div>
                
                <div class="info-box mt-4">
                    <i class="fas fa-info-circle"></i>
                    <strong>Response Time:</strong> We aim to respond to all inquiries within 24-48 hours during business days.
                </div>
            `
        }
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

            <div className="terms-page">
                <div className="container py-5">
                    <div className="terms-header text-center mb-5">
                        <div className="header-icon">
                            <i className="fas fa-file-contract"></i>
                        </div>
                        <h1 className="terms-title">Terms & Conditions</h1>
                        <p className="terms-subtitle">
                            Please read these terms carefully before using our blood bank services
                        </p>
                        <div className="last-updated">
                            <i className="far fa-calendar-alt me-2"></i>
                            Last Updated: February 16, 2026
                        </div>
                    </div>

                    <div className="important-banner mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                        <div>
                            <strong>Important Notice:</strong> These Terms and Conditions constitute a legally binding agreement.
                            By using our Platform, you acknowledge that you have read and agree to these terms.
                        </div>
                    </div>

                    <div className="terms-accordion">
                        {termsContent.map((section, index) => {
                            const isActive = activeSection === index;
                            return (
                                <div className="accordion-section" key={section.id}>
                                    <div
                                        className={`accordion-header ${isActive ? "active" : ""}`}
                                        onClick={() => toggleSection(index)}
                                    >
                                        <div className="header-content">
                                            <div className="section-icon">
                                                <i className={`fas ${section.icon}`}></i>
                                            </div>
                                            <h3 className="section-title">
                                                {section.id}. {section.title}
                                            </h3>
                                        </div>
                                        <i className={`fas ${isActive ? "fa-chevron-up" : "fa-chevron-down"} toggle-icon`}></i>
                                    </div>
                                    <div className={`accordion-content ${isActive ? "active" : ""}`}>
                                        <div
                                            className="content-body"
                                            dangerouslySetInnerHTML={{ __html: section.content }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="acceptance-section">
                        <div className="acceptance-card">
                            <div className="acceptance-header">
                                <i className="fas fa-check-circle"></i>
                                <h3>Agreement & Acceptance</h3>
                            </div>

                            <div className="acceptance-body">
                                <p className="acknowledgment-text">
                                    By checking the box below, you acknowledge that:
                                </p>
                                <ul className="acknowledgment-list">
                                    <li><i className="fas fa-check"></i> You have read and understood all sections of these Terms and Conditions</li>
                                    <li><i className="fas fa-check"></i> You agree to comply with all terms, policies, and guidelines outlined above</li>
                                    <li><i className="fas fa-check"></i> You are legally eligible to use our blood bank services</li>
                                    <li><i className="fas fa-check"></i> The information you provide will be accurate and truthful</li>
                                    <li><i className="fas fa-check"></i> You understand the risks, responsibilities, and limitations described</li>
                                </ul>

                                <div className="checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        <span className="checkbox-label">
                                            I have read, understood, and agree to the Terms and Conditions
                                        </span>
                                    </label>
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className={`btn btn-accept ${!agreed ? "disabled" : ""}`}
                                        onClick={handleAccept}
                                        disabled={!agreed}
                                    >
                                        <i className="fas fa-check-circle me-2"></i>
                                        Accept & Continue
                                    </button>
                                    <button
                                        className="btn btn-decline"
                                        onClick={() => navigate("/")}
                                    >
                                        <i className="fas fa-times-circle me-2"></i>
                                        Decline
                                    </button>
                                </div>

                                <p className="help-text">
                                    <i className="fas fa-question-circle me-2"></i>
                                    Have questions? <a href="/contact">Contact us</a> or view our <a href="/faq">FAQ</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </Box>
    );
};

export default Terms;
