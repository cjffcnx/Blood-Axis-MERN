import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API, { buildBackendFileUrl } from "../../services/API";
import { toast } from "react-toastify";

const AccountRequests = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);
    const [rejectForm, setRejectForm] = useState({ subject: "", reason: "" });
    const [submittingReject, setSubmittingReject] = useState(false);

    const getRequests = async (search = "") => {
        try {
            const { data } = await API.get("/account-requests", {
                params: search ? { search } : {},
            });
            if (data?.success) {
                setData(data?.requests);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getRequests("");
    }, []);

    useEffect(() => {
        getRequests(appliedSearch);
    }, [appliedSearch]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setAppliedSearch(searchTerm.trim());
    };

    const handleSearchClear = () => {
        setSearchTerm("");
        setAppliedSearch("");
    };

    const handleStatus = async (id, status) => {
        try {
            let answer = window.confirm(
                `Are you sure you want to ${status} this request?`
            );
            if (!answer) return;

            const { data } = await API.put(`/account-requests/${id}/status`, { status });
            if (data?.success) {
                toast.success(data.message);
                getRequests();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    const openRejectModal = (id) => {
        setRejectingRequestId(id);
        setRejectForm({ subject: "", reason: "" });
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        if (submittingReject) return;
        setShowRejectModal(false);
        setRejectingRequestId(null);
        setRejectForm({ subject: "", reason: "" });
    };

    const handleRejectInput = (event) => {
        const { name, value } = event.target;
        setRejectForm((prev) => ({ ...prev, [name]: value }));
    };

    const submitRejection = async () => {
        try {
            if (!rejectingRequestId) return;

            const subject = rejectForm.subject.trim();
            const reason = rejectForm.reason.trim();

            if (!subject) {
                toast.error("Subject is required");
                return;
            }

            if (!reason) {
                toast.error("Reason is required");
                return;
            }

            setSubmittingReject(true);

            const { data } = await API.put(`/account-requests/${rejectingRequestId}/status`, {
                status: "rejected",
                subject,
                reason,
                adminComments: reason,
            });

            if (data?.success) {
                toast.success(data.message);
                closeRejectModal();
                getRequests();
            } else {
                toast.error(data?.message || "Failed to reject request");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setSubmittingReject(false);
        }
    };

    return (
        <Layout>
            <div className="container mt-4">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <h1 className="mb-0">Account Requests</h1>
                    <form className="d-flex flex-wrap align-items-center gap-2 ms-auto" onSubmit={handleSearchSubmit}>
                        <input
                            className="form-control"
                            style={{ minWidth: "260px" }}
                            placeholder="Search name, email, phone, role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">Search</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={handleSearchClear}>Clear</button>
                    </form>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Role</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Date</th>
                            <th scope="col">Proof</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>
                                    {record.role === "organisation"
                                        ? record.organisationName
                                        : record.hospitalName}
                                    <br />
                                    <small className="text-muted">{record.name}</small>
                                </td>
                                <td>{record.role}</td>
                                <td>{record.email}</td>
                                <td>{record.phone}</td>
                                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                <td>
                                    <a
                                        href={buildBackendFileUrl(record.proofFile)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-info"
                                    >
                                        View
                                    </a>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-success btn-sm me-2"
                                        onClick={() => handleStatus(record._id, "approved")}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => openRejectModal(record._id)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {data?.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center">No pending requests</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {showRejectModal && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reject Account Request</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeRejectModal}
                                        disabled={submittingReject}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="reject-subject" className="form-label">
                                            Subject <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="reject-subject"
                                            name="subject"
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter rejection email subject"
                                            value={rejectForm.subject}
                                            onChange={handleRejectInput}
                                            disabled={submittingReject}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="reject-reason" className="form-label">
                                            Reason <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            id="reject-reason"
                                            name="reason"
                                            className="form-control"
                                            rows="5"
                                            placeholder="Enter rejection reason"
                                            value={rejectForm.reason}
                                            onChange={handleRejectInput}
                                            disabled={submittingReject}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeRejectModal}
                                        disabled={submittingReject}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={submitRejection}
                                        disabled={submittingReject}
                                    >
                                        {submittingReject ? "Submitting..." : "Reject Request"}
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

export default AccountRequests;
