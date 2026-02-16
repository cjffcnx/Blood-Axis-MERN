import React, { useState } from "react";
import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import { WaterDrop } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Footer from '../components/shared/Footer/Footer';
import "./Privacy.css";

const Privacy = () => {
    const [activeSection, setActiveSection] = useState(null);
    const navigate = useNavigate();

    const toggleSection = (index) => {
        setActiveSection(activeSection === index ? null : index);
    };

    const privacyContent = [
        {
            id: 1,
            icon: "fa-info-circle",
            title: "Introduction",
            content: `
                <p>At Blood Bank Management System, we are committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our blood donation and management platform.</p>
                
                <p>We understand the sensitive nature of health-related data and adhere to the highest standards of data protection, including compliance with applicable healthcare privacy laws and regulations.</p>
                
                <p><strong>By using our Platform, you consent to the data practices described in this Privacy Policy.</strong> If you do not agree with our policies and practices, please do not use our services.</p>
                
                <div class="important-note">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <strong>Your Privacy Matters:</strong> We will never sell, rent, or share your personal information with third parties for marketing purposes without your explicit consent.
                    </div>
                </div>
            `
        },
        {
            id: 2,
            icon: "fa-database",
            title: "Information We Collect",
            content: `
                <p>We collect various types of information to provide and improve our blood bank services:</p>
                
                <h4>1. Personal Information</h4>
                <p>Information that identifies you as an individual:</p>
                <ul>
                    <li><strong>Identity Data:</strong> Full name, date of birth, gender, national ID number</li>
                    <li><strong>Contact Data:</strong> Email address, phone number, residential address</li>
                    <li><strong>Account Data:</strong> Username, password, profile picture</li>
                    <li><strong>Blood Type Data:</strong> Blood group (A+, A-, B+, B-, O+, O-, AB+, AB-)</li>
                </ul>
                
                <h4>2. Health Information</h4>
                <p>Medical and health-related information necessary for safe donation:</p>
                <ul>
                    <li>Medical history and conditions</li>
                    <li>Current medications and treatments</li>
                    <li>Previous blood donation records</li>
                    <li>Screening test results (hemoglobin, blood pressure, temperature)</li>
                    <li>Infectious disease screening results (HIV, Hepatitis B/C, etc.)</li>
                    <li>Allergies and adverse reactions</li>
                    <li>Pregnancy and breastfeeding status</li>
                    <li>Recent travel history (for disease risk assessment)</li>
                </ul>
                
                <h4>3. Technical Information</h4>
                <p>Data collected automatically when you use our Platform:</p>
                <ul>
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Access times and dates</li>
                    <li>Pages viewed and navigation paths</li>
                    <li>Location data (with your permission)</li>
                    <li>Cookies and similar tracking technologies</li>
                </ul>
                
                <h4>4. Transaction Information</h4>
                <ul>
                    <li>Blood request details and quantities</li>
                    <li>Payment and billing information</li>
                    <li>Transaction history and receipts</li>
                    <li>Hospital and organization affiliations</li>
                </ul>
                
                <h4>5. Communications</h4>
                <ul>
                    <li>Messages sent through our Platform</li>
                    <li>Email correspondence</li>
                    <li>Customer service interactions</li>
                    <li>Feedback and survey responses</li>
                </ul>
                
                <div class="info-box">
                    <i class="fas fa-user-shield"></i>
                    <div>
                        <strong>Data Minimization:</strong> We only collect information that is necessary for providing our blood bank services and ensuring donor and recipient safety.
                    </div>
                </div>
            `
        },
        {
            id: 3,
            icon: "fa-cogs",
            title: "How We Use Your Information",
            content: `
                <p>We use the collected information for the following purposes:</p>
                
                <h4>1. Service Provision</h4>
                <ul>
                    <li>Create and manage your account</li>
                    <li>Process blood donation appointments and requests</li>
                    <li>Match donors with recipients based on blood type compatibility</li>
                    <li>Schedule donation appointments and send reminders</li>
                    <li>Facilitate blood collection, storage, and distribution</li>
                    <li>Process payments and generate receipts</li>
                </ul>
                
                <h4>2. Health & Safety</h4>
                <ul>
                    <li>Assess donor eligibility and health suitability</li>
                    <li>Screen for infectious diseases and health risks</li>
                    <li>Ensure blood safety and quality standards</li>
                    <li>Track donation history to prevent over-donation</li>
                    <li>Monitor post-donation adverse events</li>
                    <li>Contact donors in case of urgent medical findings</li>
                </ul>
                
                <h4>3. Communication</h4>
                <ul>
                    <li>Send appointment confirmations and reminders</li>
                    <li>Notify you of urgent blood needs in your area</li>
                    <li>Provide donation certificates and thank-you messages</li>
                    <li>Send updates about our services and policies</li>
                    <li>Respond to your inquiries and support requests</li>
                    <li>Conduct donor satisfaction surveys</li>
                </ul>
                
                <h4>4. Platform Improvement</h4>
                <ul>
                    <li>Analyze usage patterns to improve user experience</li>
                    <li>Develop new features and services</li>
                    <li>Troubleshoot technical issues</li>
                    <li>Optimize Platform performance</li>
                    <li>Conduct research and analytics (using anonymized data)</li>
                </ul>
                
                <h4>5. Legal & Compliance</h4>
                <ul>
                    <li>Comply with healthcare regulations and blood bank standards</li>
                    <li>Maintain required health records and documentation</li>
                    <li>Respond to legal requests and court orders</li>
                    <li>Prevent fraud and ensure security</li>
                    <li>Enforce our Terms and Conditions</li>
                </ul>
                
                <h4>6. Emergency Response</h4>
                <ul>
                    <li>Coordinate emergency blood supply during disasters</li>
                    <li>Contact eligible donors for urgent requests</li>
                    <li>Share critical information with healthcare facilities</li>
                </ul>
            `
        },
        {
            id: 4,
            icon: "fa-share-alt",
            title: "Information Sharing & Disclosure",
            content: `
                <p>We respect your privacy and only share your information in the following limited circumstances:</p>
                
                <h4>1. Healthcare Providers</h4>
                <p>We may share your information with:</p>
                <ul>
                    <li><strong>Hospitals:</strong> When processing blood requests for transfusions</li>
                    <li><strong>Medical Laboratories:</strong> For blood testing and screening purposes</li>
                    <li><strong>Healthcare Professionals:</strong> Involved in your donation or transfusion care</li>
                    <li><strong>Emergency Services:</strong> In life-threatening situations</li>
                </ul>
                
                <h4>2. Service Providers</h4>
                <p>Third-party vendors who assist us in operating our Platform:</p>
                <ul>
                    <li>Cloud hosting and data storage providers</li>
                    <li>Payment processors (eSewa, Khalti)</li>
                    <li>Email and SMS notification services</li>
                    <li>IT security and infrastructure providers</li>
                    <li>Analytics and performance monitoring tools</li>
                </ul>
                <p class="note">All service providers are contractually bound to protect your data and use it only for specified purposes.</p>
                
                <h4>3. Regulatory Authorities</h4>
                <ul>
                    <li>Ministry of Health and Population (Nepal)</li>
                    <li>National Blood Transfusion Service</li>
                    <li>Drug Administration Department</li>
                    <li>Other governmental health authorities as required by law</li>
                </ul>
                
                <h4>4. Legal Obligations</h4>
                <p>We may disclose your information when required to:</p>
                <ul>
                    <li>Comply with court orders or legal processes</li>
                    <li>Respond to lawful government requests</li>
                    <li>Protect our rights and property</li>
                    <li>Investigate fraud or security threats</li>
                    <li>Protect the safety of our users and the public</li>
                </ul>
                
                <h4>5. Research (Anonymized Data)</h4>
                <ul>
                    <li>Medical research institutions (with ethical approval)</li>
                    <li>Public health studies and epidemiological research</li>
                    <li>Blood bank operations research</li>
                </ul>
                <p class="note">Research data is always anonymized and cannot be traced back to individual donors.</p>
                
                <h4>6. Business Transfers</h4>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.</p>
                
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>We Never:</strong>
                        <ul>
                            <li>Sell your personal or health information to third parties</li>
                            <li>Share your data for marketing purposes without consent</li>
                            <li>Disclose your information to unauthorized parties</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 5,
            icon: "fa-lock",
            title: "Data Security Measures",
            content: `
                <p>We implement comprehensive security measures to protect your information from unauthorized access, alteration, disclosure, or destruction:</p>
                
                <h4>Technical Safeguards</h4>
                <ul>
                    <li><strong>Encryption:</strong> All data transmitted is encrypted using industry-standard SSL/TLS protocols</li>
                    <li><strong>Secure Storage:</strong> Data stored in encrypted databases with restricted access</li>
                    <li><strong>Firewalls:</strong> Multi-layered firewall protection against cyber threats</li>
                    <li><strong>Authentication:</strong> Strong password requirements and secure login systems</li>
                    <li><strong>Regular Updates:</strong> Security patches and software updates applied promptly</li>
                    <li><strong>Intrusion Detection:</strong> Automated systems monitor for suspicious activities</li>
                </ul>
                
                <h4>Administrative Safeguards</h4>
                <ul>
                    <li><strong>Access Controls:</strong> Role-based access with minimum necessary privileges</li>
                    <li><strong>Employee Training:</strong> Regular privacy and security awareness programs</li>
                    <li><strong>Confidentiality Agreements:</strong> All staff sign strict confidentiality agreements</li>
                    <li><strong>Incident Response:</strong> Documented procedures for data breach response</li>
                    <li><strong>Audit Trails:</strong> Comprehensive logging of data access and modifications</li>
                </ul>
                
                <h4>Physical Safeguards</h4>
                <ul>
                    <li>Secure data centers with 24/7 surveillance</li>
                    <li>Controlled access to facilities and equipment</li>
                    <li>Environmental controls (temperature, humidity, fire protection)</li>
                    <li>Secure disposal of physical records</li>
                </ul>
                
                <h4>Regular Security Assessments</h4>
                <ul>
                    <li>Annual third-party security audits</li>
                    <li>Vulnerability assessments and penetration testing</li>
                    <li>Security risk assessments</li>
                    <li>Compliance monitoring and reviews</li>
                </ul>
                
                <h4>Your Security Responsibilities</h4>
                <p>You can help protect your information by:</p>
                <ul>
                    <li>Using strong, unique passwords</li>
                    <li>Not sharing your account credentials</li>
                    <li>Logging out from shared devices</li>
                    <li>Enabling two-factor authentication (when available)</li>
                    <li>Reporting suspicious activities immediately</li>
                    <li>Keeping your contact information updated</li>
                </ul>
                
                <div class="security-badge">
                    <i class="fas fa-certificate"></i>
                    <div>
                        <strong>Security Commitment:</strong> Despite our best efforts, no method of transmission over the internet is 100% secure. If you suspect a security breach, please contact us immediately at security@bloodbank.com
                    </div>
                </div>
            `
        },
        {
            id: 6,
            icon: "fa-cookie-bite",
            title: "Cookies & Tracking Technologies",
            content: `
                <p>We use cookies and similar technologies to enhance your experience on our Platform:</p>
                
                <h4>What Are Cookies?</h4>
                <p>Cookies are small text files stored on your device that help us recognize you and remember your preferences.</p>
                
                <h4>Types of Cookies We Use</h4>
                
                <div class="cookie-type">
                    <strong>1. Essential Cookies (Required)</strong>
                    <ul>
                        <li>Enable core functionality like login and security</li>
                        <li>Remember your session and preferences</li>
                        <li>Cannot be disabled without affecting Platform functionality</li>
                    </ul>
                </div>
                
                <div class="cookie-type">
                    <strong>2. Functional Cookies</strong>
                    <ul>
                        <li>Remember your language and region preferences</li>
                        <li>Store your dashboard customization</li>
                        <li>Improve your user experience</li>
                    </ul>
                </div>
                
                <div class="cookie-type">
                    <strong>3. Analytics Cookies</strong>
                    <ul>
                        <li>Track how you use our Platform (Google Analytics)</li>
                        <li>Help us understand user behavior patterns</li>
                        <li>Enable us to improve Platform performance</li>
                        <li>Generate usage statistics (anonymized)</li>
                    </ul>
                </div>
                
                <div class="cookie-type">
                    <strong>4. Performance Cookies</strong>
                    <ul>
                        <li>Monitor Platform speed and reliability</li>
                        <li>Identify technical issues</li>
                        <li>Optimize loading times</li>
                    </ul>
                </div>
                
                <h4>Managing Cookies</h4>
                <p>You can control cookies through:</p>
                <ul>
                    <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                    <li><strong>Cookie Preferences:</strong> Use our cookie consent banner to customize settings</li>
                    <li><strong>Opt-Out Tools:</strong> Google Analytics opt-out browser add-on</li>
                </ul>
                
                <p class="note"><strong>Note:</strong> Disabling essential cookies may affect Platform functionality, such as login and security features.</p>
                
                <h4>Other Tracking Technologies</h4>
                <ul>
                    <li><strong>Web Beacons:</strong> Small graphic images that track email opens and engagement</li>
                    <li><strong>Local Storage:</strong> Stores data locally on your device for offline functionality</li>
                    <li><strong>Session Storage:</strong> Temporary storage cleared when you close your browser</li>
                </ul>
            `
        },
        {
            id: 7,
            icon: "fa-user-cog",
            title: "Your Privacy Rights",
            content: `
                <p>You have the following rights regarding your personal and health information:</p>
                
                <h4>1. Right to Access</h4>
                <ul>
                    <li>View all personal information we hold about you</li>
                    <li>Download your donation history and health records</li>
                    <li>Request a copy of your data in portable format</li>
                </ul>
                <p class="action-link"><i class="fas fa-arrow-right"></i> Access your data: Log in to your <a href="/donor-dashboard">Dashboard</a> → Profile Settings → Download My Data</p>
                
                <h4>2. Right to Rectification</h4>
                <ul>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Update your contact details and preferences</li>
                    <li>Modify your health information (subject to verification)</li>
                </ul>
                <p class="action-link"><i class="fas fa-arrow-right"></i> Update your information: Dashboard → Edit Profile</p>
                
                <h4>3. Right to Erasure ("Right to be Forgotten")</h4>
                <ul>
                    <li>Request deletion of your account and personal data</li>
                    <li>Subject to legal retention requirements (medical records must be retained for 10 years)</li>
                    <li>Anonymization of data where deletion is not possible</li>
                </ul>
                <p class="action-link"><i class="fas fa-arrow-right"></i> Delete your account: Contact <a href="/contact">Support</a> with your request</p>
                
                <h4>4. Right to Restrict Processing</h4>
                <ul>
                    <li>Limit how we use your information</li>
                    <li>Pause processing while verifying accuracy</li>
                    <li>Object to certain types of data processing</li>
                </ul>
                
                <h4>5. Right to Data Portability</h4>
                <ul>
                    <li>Receive your data in a structured, machine-readable format</li>
                    <li>Transfer your data to another service provider</li>
                    <li>Export donation records and certificates</li>
                </ul>
                
                <h4>6. Right to Object</h4>
                <ul>
                    <li>Opt-out of marketing communications</li>
                    <li>Object to automated decision-making</li>
                    <li>Refuse participation in research studies</li>
                </ul>
                <p class="action-link"><i class="fas fa-arrow-right"></i> Manage preferences: Dashboard → Communication Preferences</p>
                
                <h4>7. Right to Withdraw Consent</h4>
                <ul>
                    <li>Withdraw your consent for data processing at any time</li>
                    <li>Does not affect the lawfulness of processing before withdrawal</li>
                    <li>May limit access to certain services</li>
                </ul>
                
                <h4>8. Right to Lodge a Complaint</h4>
                <ul>
                    <li>File a complaint with our Data Protection Officer</li>
                    <li>Contact relevant data protection authorities</li>
                    <li>Seek legal remedies if rights are violated</li>
                </ul>
                
                <h4>How to Exercise Your Rights</h4>
                <p>To exercise any of these rights, please:</p>
                <ul>
                    <li><strong>Email:</strong> privacy@bloodbank.com</li>
                    <li><strong>Phone:</strong> +977-1-4412303</li>
                    <li><strong>Mail:</strong> Data Protection Officer, Kathmandu Blood Bank, Maharajgunj, Kathmandu, Nepal</li>
                </ul>
                
                <p class="note">We will respond to your request within 30 days. Some requests may require identity verification to protect your information.</p>
                
                <div class="rights-summary">
                    <i class="fas fa-balance-scale"></i>
                    <strong>Your Rights at a Glance:</strong> Access • Correct • Delete • Restrict • Port • Object • Withdraw Consent • Complain
                </div>
            `
        },
        {
            id: 8,
            icon: "fa-clock",
            title: "Data Retention",
            content: `
                <p>We retain your information only as long as necessary to fulfill the purposes outlined in this Privacy Policy and comply with legal obligations:</p>
                
                <h4>Retention Periods</h4>
                
                <div class="retention-item">
                    <strong>Medical Records & Donation History</strong>
                    <ul>
                        <li><strong>Retention:</strong> Minimum 10 years from last donation</li>
                        <li><strong>Reason:</strong> Healthcare regulations, traceability, medical safety</li>
                        <li><strong>Includes:</strong> Screening results, test outcomes, donation details</li>
                    </ul>
                </div>
                
                <div class="retention-item">
                    <strong>Account Information</strong>
                    <ul>
                        <li><strong>Active Accounts:</strong> Retained while account is active</li>
                        <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity</li>
                        <li><strong>Deactivated Accounts:</strong> Personal data deleted within 90 days (medical records retained as required)</li>
                    </ul>
                </div>
                
                <div class="retention-item">
                    <strong>Transaction Records</strong>
                    <ul>
                        <li><strong>Retention:</strong> 7 years</li>
                        <li><strong>Reason:</strong> Tax compliance, financial audits, legal requirements</li>
                        <li><strong>Includes:</strong> Invoices, receipts, payment information</li>
                    </ul>
                </div>
                
                <div class="retention-item">
                    <strong>Communications</strong>
                    <ul>
                        <li><strong>Support Tickets:</strong> 3 years</li>
                        <li><strong>Email Communications:</strong> 2 years</li>
                        <li><strong>Chat Logs:</strong> 1 year</li>
                    </ul>
                </div>
                
                <div class="retention-item">
                    <strong>Technical & Usage Data</strong>
                    <ul>
                        <li><strong>Server Logs:</strong> 90 days</li>
                        <li><strong>Analytics Data:</strong> Anonymized and retained indefinitely</li>
                        <li><strong>Cookies:</strong> Varies by type (see Cookie Policy)</li>
                    </ul>
                </div>
                
                <h4>Secure Disposal</h4>
                <p>When data is no longer needed, we ensure secure disposal:</p>
                <ul>
                    <li>Permanent deletion from active databases</li>
                    <li>Removal from backup systems within 90 days</li>
                    <li>Physical destruction of paper records (shredding)</li>
                    <li>Secure wiping of electronic storage media</li>
                    <li>Certification of destruction for sensitive data</li>
                </ul>
                
                <h4>Legal Holds</h4>
                <p>We may retain data beyond normal retention periods when:</p>
                <ul>
                    <li>Required by law or legal proceedings</li>
                    <li>Necessary for ongoing investigations</li>
                    <li>Subject to regulatory audit or inquiry</li>
                    <li>Needed to enforce our rights or defend claims</li>
                </ul>
            `
        },
        {
            id: 9,
            icon: "fa-child",
            title: "Children's Privacy",
            content: `
                <p>Our Platform is not intended for children under the age of 18, except in specific circumstances:</p>
                
                <h4>General Policy</h4>
                <ul>
                    <li>We do not knowingly collect personal information from children under 18</li>
                    <li>Users must be 18 years or older to create an account</li>
                    <li>If we discover we have collected data from a child under 18, we will delete it promptly</li>
                </ul>
                
                <h4>Minors Aged 16-17 (With Parental Consent)</h4>
                <p>In limited cases, donors aged 16-17 may donate with:</p>
                <ul>
                    <li>Written parental or guardian consent</li>
                    <li>Medical approval from a qualified physician</li>
                    <li>Parent/guardian account oversight</li>
                    <li>Enhanced privacy protections</li>
                </ul>
                
                <h4>Parental Rights</h4>
                <p>Parents/guardians of minor donors can:</p>
                <ul>
                    <li>Access their child's donation records</li>
                    <li>Request correction or deletion of information</li>
                    <li>Withdraw consent for data processing</li>
                    <li>Receive copies of all communications</li>
                </ul>
                
                <h4>If You Are a Parent</h4>
                <p>If you believe we have collected information from a child without proper consent, please contact us immediately at privacy@bloodbank.com</p>
                
                <div class="important-note">
                    <i class="fas fa-child"></i>
                    <div>
                        <strong>Protecting Minors:</strong> We take the privacy and safety of minors seriously and comply with all applicable child protection laws.
                    </div>
                </div>
            `
        },
        {
            id: 10,
            icon: "fa-globe",
            title: "International Data Transfers",
            content: `
                <p>Our Platform primarily operates within Nepal, but certain data processing may occur internationally:</p>
                
                <h4>Where Your Data May Be Processed</h4>
                <ul>
                    <li><strong>Primary Storage:</strong> Nepal (local data centers)</li>
                    <li><strong>Cloud Services:</strong> May be hosted on servers in India, Singapore, or USA</li>
                    <li><strong>Service Providers:</strong> Some vendors operate from other countries</li>
                </ul>
                
                <h4>Data Transfer Safeguards</h4>
                <p>When data is transferred internationally, we ensure:</p>
                <ul>
                    <li>Adequate level of data protection in recipient country</li>
                    <li>Standard contractual clauses with service providers</li>
                    <li>Compliance with data protection regulations</li>
                    <li>Encryption during transmission</li>
                    <li>Regular audits of third-party processors</li>
                </ul>
                
                <h4>Your Rights Regarding International Transfers</h4>
                <ul>
                    <li>You have the right to know where your data is processed</li>
                    <li>You can object to certain international transfers</li>
                    <li>You can request that data be stored only in Nepal (may limit services)</li>
                </ul>
            `
        },
        {
            id: 11,
            icon: "fa-bell",
            title: "Changes to This Privacy Policy",
            content: `
                <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>
                
                <h4>How We Notify You</h4>
                <ul>
                    <li><strong>Material Changes:</strong> Email notification to registered users at least 30 days before implementation</li>
                    <li><strong>Minor Changes:</strong> Notification banner on Platform homepage</li>
                    <li><strong>All Changes:</strong> Updated "Last Revised" date at the top of this policy</li>
                </ul>
                
                <h4>Your Options</h4>
                <p>When we make material changes:</p>
                <ul>
                    <li>You will be asked to review and accept the updated policy</li>
                    <li>Continued use of the Platform constitutes acceptance</li>
                    <li>You may object or delete your account if you disagree</li>
                </ul>
                
                <h4>Review Frequency</h4>
                <ul>
                    <li>We review this policy annually</li>
                    <li>Updates may occur more frequently if needed</li>
                    <li>We encourage you to check this page periodically</li>
                </ul>
                
                <div class="info-box">
                    <i class="fas fa-history"></i>
                    <div>
                        <strong>Version History:</strong> Previous versions of this Privacy Policy are available upon request. Contact privacy@bloodbank.com
                    </div>
                </div>
            `
        },
        {
            id: 12,
            icon: "fa-envelope",
            title: "Contact Us",
            content: `
                <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
                
                <h4>Data Protection Officer</h4>
                <div class="contact-box">
                    <div class="contact-row">
                        <i class="fas fa-user"></i>
                        <div>
                            <strong>Name:</strong> Privacy & Compliance Team<br>
                            Blood Bank Management System
                        </div>
                    </div>
                    
                    <div class="contact-row">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <strong>Email:</strong><br>
                            <a href="mailto:privacy@bloodbank.com">privacy@bloodbank.com</a><br>
                            <a href="mailto:dpo@bloodbank.com">dpo@bloodbank.com</a>
                        </div>
                    </div>
                    
                    <div class="contact-row">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>Phone:</strong><br>
                            +977-1-4412303 (General Inquiries)<br>
                            +977-1-4410911 (Data Protection)
                        </div>
                    </div>
                    
                    <div class="contact-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Postal Address:</strong><br>
                            Data Protection Officer<br>
                            Blood Bank Management System<br>
                            Kathmandu Blood Bank<br>
                            Maharajgunj, Kathmandu 44600<br>
                            Nepal
                        </div>
                    </div>
                    
                    <div class="contact-row">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Response Time:</strong><br>
                            We aim to respond to all privacy inquiries within 48 hours on business days.
                        </div>
                    </div>
                </div>
                
                <h4>Report a Privacy Concern</h4>
                <p>If you believe your privacy rights have been violated or you have a data security concern:</p>
                <ul>
                    <li><strong>Email:</strong> security@bloodbank.com (for urgent security issues)</li>
                    <li><strong>Form:</strong> Submit a <a href="/contact">Privacy Complaint Form</a></li>
                    <li><strong>Phone:</strong> +977-985-123-4567 (24/7 Emergency Line)</li>
                </ul>
                
                <h4>Regulatory Authorities</h4>
                <p>You also have the right to lodge a complaint with:</p>
                <ul>
                    <li>Ministry of Health and Population, Nepal</li>
                    <li>National Information Technology Center (NITC)</li>
                    <li>Relevant data protection or privacy authorities</li>
                </ul>
                
                <div class="commitment-box">
                    <i class="fas fa-heart"></i>
                    <strong>Our Commitment:</strong> We take your privacy seriously and are committed to addressing your concerns promptly and transparently. Your trust is our priority.
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

            <div className="privacy-page">
                <div className="container py-5">
                    <div className="privacy-header text-center mb-5">
                        <div className="header-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h1 className="privacy-title">Privacy Policy</h1>
                        <p className="privacy-subtitle">
                            Your privacy is our priority. Learn how we protect and manage your personal and health information.
                        </p>
                        <div className="last-updated">
                            <i className="far fa-calendar-alt me-2"></i>
                            Last Updated: February 16, 2026
                        </div>
                    </div>

                    <div className="quick-summary mb-5">
                        <h3><i className="fas fa-bolt me-2"></i>Privacy at a Glance</h3>
                        <div className="summary-grid">
                            <div className="summary-card">
                                <i className="fas fa-user-shield"></i>
                                <h4>We Protect Your Data</h4>
                                <p>Bank-level encryption and security measures</p>
                            </div>
                            <div className="summary-card">
                                <i className="fas fa-ban"></i>
                                <h4>We Don't Sell Data</h4>
                                <p>Your information is never sold to third parties</p>
                            </div>
                            <div className="summary-card">
                                <i className="fas fa-hand-paper"></i>
                                <h4>You Have Control</h4>
                                <p>Access, modify, or delete your data anytime</p>
                            </div>
                            <div className="summary-card">
                                <i className="fas fa-check-circle"></i>
                                <h4>Transparent Practices</h4>
                                <p>Clear information about data collection and use</p>
                            </div>
                        </div>
                    </div>

                    <div className="table-of-contents mb-5">
                        <h3><i className="fas fa-list me-2"></i>Table of Contents</h3>
                        <div className="toc-grid">
                            {privacyContent.map((section, index) => (
                                <button
                                    key={section.id}
                                    className="toc-item"
                                    onClick={() => {
                                        setActiveSection(index);
                                        document.getElementById(`section-${section.id}`)?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start"
                                        });
                                    }}
                                >
                                    <i className={`fas ${section.icon}`}></i>
                                    <span>{section.id}. {section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="privacy-accordion">
                        {privacyContent.map((section, index) => {
                            const isActive = activeSection === index;
                            return (
                                <div
                                    className="accordion-section"
                                    key={section.id}
                                    id={`section-${section.id}`}
                                >
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

                    <div className="help-section text-center mt-5">
                        <h3>Need Help Understanding Your Privacy Rights?</h3>
                        <p>Our team is here to answer your questions and address your concerns.</p>
                        <div className="help-buttons">
                            <Link component={RouterLink} to="/contact" className="btn btn-warning">
                                <i className="fas fa-envelope me-2"></i>
                                Contact Privacy Team
                            </Link>
                            <Link component={RouterLink} to="/faq" className="btn btn-outline-success">
                                <i className="fas fa-question-circle me-2"></i>
                                View FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </Box>
    );
};

export default Privacy;
