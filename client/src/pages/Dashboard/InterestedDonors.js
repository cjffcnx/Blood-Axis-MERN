import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { toast } from "react-toastify";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Box,
    Button,
    Select,
    MenuItem,
    FormControl,
    TextField
} from "@mui/material";

const InterestedDonors = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
    const [sendingEmail, setSendingEmail] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const getInterestedDonors = async (search = "") => {
        try {
            setLoading(true);
            const response = await API.get("/donor-interest/organisation/interested-donors", {
                params: search ? { search } : {},
            });
            if (response.data?.success) {
                setData(response.data.interests);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (interestId, newStatus) => {
        try {
            const response = await API.put("/donor-interest/update-status", {
                interestId,
                status: newStatus,
            });

            if (response.data?.success) {
                alert("Status updated successfully");
                getInterestedDonors(appliedSearch); // Refresh the list
            }
        } catch (error) {
            console.log(error);
            alert("Error updating status");
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setAppliedSearch(searchTerm.trim());
    };

    const handleSearchClear = () => {
        setSearchTerm("");
        setAppliedSearch("");
    };

    const openEmailModal = (donor) => {
        const donorInfo = donor.donor || donor;
        setSelectedDonor({
            name: donorInfo?.name || "N/A",
            email: donorInfo?.email || "",
        });
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

    useEffect(() => {
        getInterestedDonors("");
    }, []);

    useEffect(() => {
        getInterestedDonors(appliedSearch);
    }, [appliedSearch]);

    const getStatusColor = (status) => {
        const colors = {
            pending: "warning",
            contacted: "info",
            scheduled: "primary",
            completed: "success",
            cancelled: "error"
        };
        return colors[status] || "default";
    };

    if (loading) {
        return (
            <Layout>
                <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography>Loading...</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Box
                    component="form"
                    onSubmit={handleSearchSubmit}
                    sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}
                >
                    <Typography variant="h4" sx={{ fontWeight: "bold", mr: "auto" }}>
                        Interested Donors
                    </Typography>
                    <TextField
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search donors, city, blood group, status..."
                        size="small"
                        sx={{ minWidth: 280 }}
                    />
                    <Button type="submit" variant="contained" size="small">
                        Search
                    </Button>
                    <Button type="button" variant="outlined" size="small" onClick={handleSearchClear}>
                        Clear
                    </Button>
                </Box>

                {data.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                        <Typography>No interested donors yet.</Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell><strong>Donor Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Phone</strong></TableCell>
                                    <TableCell><strong>City</strong></TableCell>
                                    <TableCell><strong>Address</strong></TableCell>
                                    <TableCell><strong>Date of Birth</strong></TableCell>
                                    <TableCell><strong>Gender</strong></TableCell>
                                    <TableCell><strong>Blood Group</strong></TableCell>
                                    <TableCell><strong>Available Date</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Registered On</strong></TableCell>
                                    <TableCell><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((record) => (
                                    <TableRow key={record._id} hover>
                                        <TableCell>{record.donor?.name || "N/A"}</TableCell>
                                        <TableCell>{record.donor?.email || "N/A"}</TableCell>
                                        <TableCell>{record.donor?.phone || "N/A"}</TableCell>
                                        <TableCell>{record.donor?.preferredCity || "N/A"}</TableCell>
                                        <TableCell>{record.donor?.address || "N/A"}</TableCell>
                                        <TableCell>
                                            {moment(record.dateOfBirth).format("DD/MM/YYYY")}
                                        </TableCell>
                                        <TableCell>{record.gender}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.bloodGroup}
                                                color="error"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {moment(record.availability).format("DD/MM/YYYY")}
                                        </TableCell>
                                        <TableCell>
                                            <FormControl size="small" fullWidth>
                                                <Select
                                                    value={record.status}
                                                    onChange={(e) => handleStatusUpdate(record._id, e.target.value)}
                                                    sx={{ minWidth: 120 }}
                                                >
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="contacted">Contacted</MenuItem>
                                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="completed">Completed</MenuItem>
                                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    backgroundColor: "#d32f2f",
                                                    "&:hover": {
                                                        backgroundColor: "#b71c1c",
                                                    },
                                                }}
                                                onClick={() => openEmailModal(record)}
                                            >
                                                <i className="fa-solid fa-envelope" style={{ marginRight: "5px" }}></i>
                                                Email
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Email Modal */}
            {showEmailModal && selectedDonor && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: "#d32f2f", color: "white" }}>
                                <h5 className="modal-title">
                                    Send Email to {selectedDonor.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeEmailModal}
                                    disabled={sendingEmail}
                                    style={{ filter: "brightness(0) invert(1)" }}
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
                                        Subject <span style={{ color: "red" }}>*</span>
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
                                        Message <span style={{ color: "red" }}>*</span>
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
                                    style={{ backgroundColor: "#d32f2f", borderColor: "#d32f2f" }}
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
                                            <i className="fa-solid fa-paper-plane" style={{ marginRight: "5px" }}></i>
                                            Send Email
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

export default InterestedDonors;
