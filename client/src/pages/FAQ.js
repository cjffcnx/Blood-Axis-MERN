import React, { useState } from "react";
import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import { WaterDrop } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Footer from '../components/shared/Footer/Footer';
import "./FAQ.css";

const FAQ = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqData = [
        {
            category: "Blood Donation",
            questions: [
                {
                    question: "Who can donate blood?",
                    answer: "Generally, anyone between 18-65 years old, weighing at least 50 kg, and in good health can donate blood. However, certain medical conditions, medications, or recent travel may temporarily defer you from donating."
                },
                {
                    question: "How often can I donate blood?",
                    answer: "You can donate whole blood every 56 days (8 weeks). For platelet donations, you can donate every 7 days, up to 24 times a year. Always consult with our medical staff for personalized guidance."
                },
                {
                    question: "Does blood donation hurt?",
                    answer: "You may feel a brief pinch when the needle is inserted, but most donors report little to no pain during the donation process. The entire process takes about 10-15 minutes for whole blood donation."
                },
                {
                    question: "How much blood is taken during donation?",
                    answer: "A standard whole blood donation is approximately 450-500 ml (about one pint). This amount is safe and your body replenishes it within 24-48 hours."
                },
                {
                    question: "What should I do before donating blood?",
                    answer: "Get a good night's sleep, eat a healthy meal, drink plenty of water, avoid fatty foods, and bring a valid ID. Avoid alcohol 24 hours before donation."
                }
            ]
        },
        {
            category: "Safety & Health",
            questions: [
                {
                    question: "Is blood donation safe?",
                    answer: "Yes, blood donation is completely safe. We use sterile, single-use needles and equipment for every donation. There is no risk of contracting any disease from donating blood."
                },
                {
                    question: "Will I feel weak after donating?",
                    answer: "Most people feel fine after donating. You may feel slightly tired, so we recommend resting for 10-15 minutes and having some refreshments. Avoid heavy lifting or strenuous exercise for the rest of the day."
                },
                {
                    question: "Can I get COVID-19 from blood transfusion?",
                    answer: "No, there is no evidence that COVID-19 can be transmitted through blood transfusion. All blood donations are screened and processed following strict safety protocols."
                },
                {
                    question: "What if I have a tattoo or piercing?",
                    answer: "You can donate blood 6 months after getting a tattoo or piercing, provided it was done at a licensed establishment using sterile equipment."
                }
            ]
        },
        {
            category: "Blood Requests",
            questions: [
                {
                    question: "How do I request blood?",
                    answer: "You can request blood through our online portal by filling out the blood request form with patient details, required blood type, and quantity. Hospital verification may be required for urgent requests."
                },
                {
                    question: "How long does it take to fulfill a blood request?",
                    answer: "Availability depends on the blood type and current inventory. Common blood types (O+, A+) are usually available immediately. Rare blood types may take 24-48 hours. Emergency requests are prioritized."
                },
                {
                    question: "What is the cost of blood?",
                    answer: "Blood itself is donated freely. However, there are processing, testing, storage, and administrative costs. The rate is Rs. 400 per unit. Payment can be made online or on-site at the hospital."
                },
                {
                    question: "Can I donate blood for a specific person?",
                    answer: "Yes, directed donations are possible. Contact our blood bank with the patient's details and your information. Blood type compatibility will be verified before donation."
                }
            ]
        },
        {
            category: "Account & Registration",
            questions: [
                {
                    question: "How do I create an account?",
                    answer: "Click on 'Register' and choose your role (Donor, Hospital, or Organization). Fill in the required details and submit. Hospital and Organization accounts require admin approval."
                },
                {
                    question: "I forgot my password. What should I do?",
                    answer: "Click on 'Forgot Password' on the login page. Enter your registered email, and you'll receive a password reset link. Follow the instructions to create a new password."
                },
                {
                    question: "Can I update my contact information?",
                    answer: "Yes, log in to your dashboard and navigate to your profile settings to update your contact information, address, or other personal details."
                },
                {
                    question: "How do I delete my account?",
                    answer: "Contact our support team at support@bloodbank.com with your account details and reason for deletion. We'll process your request within 3-5 business days."
                }
            ]
        },
        {
            category: "Blood Types & Compatibility",
            questions: [
                {
                    question: "What is the universal blood donor type?",
                    answer: "O negative (O-) is the universal donor type. It can be given to patients of any blood type in emergency situations. O positive (O+) is the most common blood type."
                },
                {
                    question: "Which blood type is the universal recipient?",
                    answer: "AB positive (AB+) is the universal recipient and can receive blood from any blood type. However, type-specific matching is always preferred."
                },
                {
                    question: "How do I know my blood type?",
                    answer: "Your blood type may be on medical records or can be tested during your first blood donation. You can also request a blood typing test at our facility."
                },
                {
                    question: "What are rare blood types?",
                    answer: "AB negative (AB-), B negative (B-), and O negative (O-) are considered rare blood types. These types are always in high demand and we encourage donors with these types to donate regularly."
                }
            ]
        },
        {
            category: "Technical Support",
            questions: [
                {
                    question: "The website is not working properly. What should I do?",
                    answer: "Try clearing your browser cache and cookies, or use a different browser. If the problem persists, contact our technical support at support@bloodbank.com with details of the issue."
                },
                {
                    question: "Can I use the Blood Bank app on mobile?",
                    answer: "Yes, our website is mobile-responsive and works on all devices. We're also developing dedicated mobile apps for iOS and Android coming soon."
                },
                {
                    question: "How do I track my donation history?",
                    answer: "Log in to your donor dashboard to view your complete donation history, including dates, blood types, quantities, and donation certificates."
                }
            ]
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

            <div className="faq-page">
                <div className="container mt-4 mb-5">
                    <div className="faq-header text-center mb-5">
                        <h1 className="faq-title">Frequently Asked Questions</h1>
                        <p className="faq-subtitle">
                            Find answers to common questions about blood donation, requests, and our services.
                        </p>
                    </div>

                    {faqData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="faq-category mb-5">
                            <h2 className="category-title">
                                <i className="fas fa-folder-open me-2"></i>
                                {category.category}
                            </h2>
                            <div className="accordion" id={`accordion-${categoryIndex}`}>
                                {category.questions.map((item, questionIndex) => {
                                    const globalIndex = `${categoryIndex}-${questionIndex}`;
                                    const isActive = activeIndex === globalIndex;

                                    return (
                                        <div className="accordion-item" key={questionIndex}>
                                            <h3 className="accordion-header">
                                                <button
                                                    className={`accordion-button ${!isActive ? "collapsed" : ""}`}
                                                    type="button"
                                                    onClick={() => toggleAccordion(globalIndex)}
                                                >
                                                    <i className={`fas ${isActive ? "fa-minus-circle" : "fa-plus-circle"} me-3`}></i>
                                                    {item.question}
                                                </button>
                                            </h3>
                                            <div className={`accordion-collapse collapse ${isActive ? "show" : ""}`}>
                                                <div className="accordion-body">
                                                    {item.answer}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="still-questions text-center mt-5 p-5">
                        <h3 className="mb-3">Still have questions?</h3>
                        <p className="mb-4">
                            Can't find the answer you're looking for? Our support team is here to help.
                        </p>
                        <a href="/contact" className="btn btn-danger btn-lg">
                            <i className="fas fa-envelope me-2"></i>
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </Box>
    );
};

export default FAQ;
