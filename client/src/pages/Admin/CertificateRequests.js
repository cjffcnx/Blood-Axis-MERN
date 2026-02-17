import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import { toast } from "react-toastify";
import API from "../../services/API";

const CertificateRequests = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState(null);
    const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
    const [sendingEmail, setSendingEmail] = useState(false);

    // Fetch certificate requests from Google Sheet
    const getCertificateRequests = async () => {
        try {
            setLoading(true);
            // Since the certificate requests are in a Google Sheet, we'll display a link to it
            // and show donor information fetched from our database
            const { data } = await API.get("/admin/donar-list");
            if (data?.success) {
                // Filter donors with >= 8 donations (those eligible for certificates)
                const eligibleDonors = data?.donarData?.filter(
                    (donor) => donor.donationCount >= 8
                ) || [];
                setData(eligibleDonors);
            } else {
                toast.error(data?.message || "Failed to load donors");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error loading certificate requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCertificateRequests();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openEmailModal = (donor) => {
        setEmailRecipient(donor);
        setEmailForm({ subject: "", message: "" });
        setShowEmailModal(true);
    };

    const closeEmailModal = () => {
        setShowEmailModal(false);
        setEmailRecipient(null);
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
                to: emailRecipient.email,
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

    const filteredData = data.filter(
        (donor) =>
            donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="mb-4">
                <h3 className="mb-3">Certificate Requests</h3>

                <div className="alert alert-info mb-3" role="alert">
                    <i className="fa-solid fa-info-circle"></i> View all certificate requests in the Google Sheet below.
                    Donors must have completed at least 8 donations to be eligible.
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-8">
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="fa-solid fa-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search donor name or email"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    title="Clear search"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() =>
                                window.open(
                                    "https://docs.google.com/spreadsheets/d/11UjSd_e9_pY15OftPhrD93__zJzKvTcI6uyQe1RpsqI/edit?resourcekey=&gid=1482418864#gid=1482418864",
                                    "_blank"
                                )
                            }
                        >
                            <i className="fa-solid fa-sheet-plastic"></i> Open Google Sheet
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        No eligible donors found. (Donors must have at least 8 donations)
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Donations</th>
                                    <th scope="col">Registration Date</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData?.map((donor) => (
                                    <tr key={donor._id}>
                                        <td>{donor.name || "N/A"}</td>
                                        <td>{donor.email}</td>
                                        <td>{donor.phone || "N/A"}</td>
                                        <td>
                                            <span className="badge bg-success">{donor.donationCount}</span>
                                        </td>
                                        <td>
                                            {new Date(donor.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-success me-2"
                                                onClick={() => openEmailModal(donor)}
                                                title="Send email"
                                            >
                                                <i className="fa-solid fa-envelope"></i> Email
                                            </button>
                                            <button
                                                className="btn btn-sm btn-info me-2"
                                                onClick={() =>
                                                    window.open(
                                                        "https://www.canva.com/design/DAHBklv5VSk/f_YMTh79RZDIZ3K8vpb9nw/edit",
                                                        "_blank"
                                                    )
                                                }
                                                title="Edit certificate on Canva"
                                            >
                                                <i className="fa-solid fa-palette"></i> Canva
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() =>
                                                    window.open(
                                                        "https://docs.google.com/spreadsheets/d/11UjSd_e9_pY15OftPhrD93__zJzKvTcI6uyQe1RpsqI/edit?resourcekey=&gid=1482418864#gid=1482418864",
                                                        "_blank"
                                                    )
                                                }
                                                title="View in spreadsheet"
                                            >
                                                <i className="fa-solid fa-external-link"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="card mt-4" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="card-body">
                        <h5 className="card-title">
                            <i className="fa-solid fa-circle-info"></i> Certificate Criteria
                        </h5>
                        <ul>
                            <li>
                                <strong>Minimum 8 Donations:</strong> Donors must have completed
                                at least 8 successful blood donations
                            </li>
                            <li>
                                <strong>Documentation:</strong> Donors must upload proof (photos
                                or documents) of all 8 donations in PDF format
                            </li>
                            <li>
                                <strong>Verification:</strong> All requests are recorded in the
                                Google Sheet for tracking and verification
                            </li>
                        </ul>
                    </div>
                </div>

                {showEmailModal && emailRecipient && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Send Email to {emailRecipient.name}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeEmailModal}
                                        disabled={sendingEmail}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="recipient-email" className="form-label">
                                            Recipient Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="recipient-email"
                                            value={emailRecipient.email}
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
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <><i className="fa-solid fa-paper-plane"></i> Send Email</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CertificateRequests;
