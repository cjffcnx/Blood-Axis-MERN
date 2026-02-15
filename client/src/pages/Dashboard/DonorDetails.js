import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { toast } from "react-toastify";
import "./DonorDetails.css";

const DonorDetails = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
    const [sendingEmail, setSendingEmail] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch donors on component mount
    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/inventory/get-donars-with-bloodgroup");
            if (data?.success) {
                setDonors(data?.donars || []);
            } else {
                toast.error("Failed to fetch donors");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching donors");
        } finally {
            setLoading(false);
        }
    };

    const openEmailModal = (donor) => {
        setSelectedDonor(donor);
        setEmailForm({ subject: "", message: "" });
        setShowEmailModal(true);
    };

    const closeEmailModal = () => {
        setShowEmailModal(false);
        setSelectedDonor(null);
        setEmailForm({ subject: "", message: "" });
    };

    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const sendEmail = async () => {
        if (!emailForm.subject.trim()) {
            toast.error("Subject is required");
            return;
        }
        if (!emailForm.message.trim()) {
            toast.error("Message is required");
            return;
        }

        try {
            setSendingEmail(true);
            const response = await API.post("/auth/send-email", {
                to: selectedDonor.email,
                subject: emailForm.subject,
                html: `<p>${emailForm.message.replace(/\n/g, "<br>")}</p>`,
                text: emailForm.message,
            });

            if (response.data?.success) {
                toast.success("Email sent successfully!");
                closeEmailModal();
            } else {
                toast.error(response.data?.message || "Failed to send email");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error sending email");
        } finally {
            setSendingEmail(false);
        }
    };

    // Filter donors based on search term
    const filteredDonors = donors.filter((donor) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (donor.name && donor.name.toLowerCase().includes(searchLower)) ||
            (donor.email && donor.email.toLowerCase().includes(searchLower)) ||
            (donor.phone && donor.phone.toLowerCase().includes(searchLower)) ||
            (donor.bloodGroup && donor.bloodGroup.toLowerCase().includes(searchLower)) ||
            (donor.address && donor.address.toLowerCase().includes(searchLower))
        );
    });

    return (
        <Layout>
            <div className="donor-details-container">
                <h2 className="mb-4">
                    <i className="fa-solid fa-envelope"></i> Request Users (Donors)
                </h2>

                {/* Search Bar */}
                <div className="search-container mb-4">
                    <div className="search-input-group">
                        <i className="fa-solid fa-search search-icon"></i>
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search by name, email, phone, blood group, or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="btn-clear-search"
                                onClick={() => setSearchTerm("")}
                                title="Clear search"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="search-results-info">
                            Found <strong>{filteredDonors.length}</strong> result(s)
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : donors.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        No donors found in the system.
                    </div>
                ) : filteredDonors.length === 0 ? (
                    <div className="alert alert-warning" role="alert">
                        <i className="fa-solid fa-search"></i> No results found for "<strong>{searchTerm}</strong>". Try searching with different keywords.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Blood Group</th>
                                    <th scope="col">Address</th>
                                    <th scope="col">Joined Date</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDonors.map((donor, index) => (
                                    <tr key={donor._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{donor.name || "N/A"}</strong>
                                        </td>
                                        <td>{donor.email}</td>
                                        <td>{donor.phone || "N/A"}</td>
                                        <td>
                                            <span className="badge bg-danger">{donor.bloodGroup || "N/A"}</span>
                                        </td>
                                        <td>{donor.address || "N/A"}</td>
                                        <td>{moment(donor.createdAt).format("DD/MM/YYYY")}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => openEmailModal(donor)}
                                                title="Send Email to Donor"
                                            >
                                                <i className="fa-solid fa-envelope"></i> Send Email
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Email Modal */}
            {showEmailModal && selectedDonor && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Send Email to {selectedDonor.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeEmailModal}
                                    disabled={sendingEmail}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Recipient Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={selectedDonor.email}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="subject" className="form-label">
                                        Subject <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="subject"
                                        name="subject"
                                        value={emailForm.subject}
                                        onChange={handleEmailChange}
                                        placeholder="Enter email subject"
                                        disabled={sendingEmail}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">
                                        Message <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        name="message"
                                        value={emailForm.message}
                                        onChange={handleEmailChange}
                                        placeholder="Enter your message"
                                        rows="5"
                                        disabled={sendingEmail}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeEmailModal}
                                    disabled={sendingEmail}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={sendEmail}
                                    disabled={sendingEmail}
                                >
                                    {sendingEmail ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane"></i> Send Email
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DonorDetails;
