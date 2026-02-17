import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import jsPDF from "jspdf";


const BloodRequests = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [quantityEdits, setQuantityEdits] = useState({});
    const [savingQuantityId, setSavingQuantityId] = useState(null);

    //get requests based on role
    const getRequests = async () => {
        try {
            if (user?.role === "organisation") {
                const { data } = await API.get("/request/hospital-requests");
                if (data?.success) {
                    setData(data?.requests);
                    setFilteredData(data?.requests);
                }
            } else {
                // Default logic for others
                const { data } = await API.get("/request/get-approved-requests");
                if (data?.success) {
                    setData(data?.requests);
                    setFilteredData(data?.requests);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getRequests();
    }, [user]);

    useEffect(() => {
        if (user?.role !== "hospital") return;

        setQuantityEdits((prev) => {
            const next = { ...prev };
            data.forEach((record) => {
                if (next[record._id] === undefined) {
                    next[record._id] = record.quantity ?? "";
                }
            });
            return next;
        });
    }, [data, user]);

    // Filter data based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredData(data);
        } else {
            const filtered = data.filter((record) => {
                const searchLower = searchTerm.toLowerCase();
                const hospitalName = record.hospital?.hospitalName?.toLowerCase() || record.name?.toLowerCase() || "";
                const phone = record.hospital?.phone || record.phone || "";

                return (
                    hospitalName.includes(searchLower) ||
                    record.bloodGroup?.toLowerCase().includes(searchLower) ||
                    phone.includes(searchTerm) ||
                    record.status?.toLowerCase().includes(searchLower) ||
                    record.paymentStatus?.toLowerCase().includes(searchLower) ||
                    record.quantity?.toString().includes(searchTerm)
                );
            });
            setFilteredData(filtered);
        }
    }, [searchTerm, data]);

    const handleFulfill = async (id) => {
        try {
            let answer = window.confirm("Are you sure you want to send blood for this request?");
            if (!answer) return;

            const { data } = await API.put(`/request/fulfill/${id}`);
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
    }

    const handleMarkPaid = async (id) => {
        try {
            let answer = window.confirm("Mark this request as paid?");
            if (!answer) return;

            const { data } = await API.put(`/request/payment-status/${id}`, {
                paymentStatus: "paid",
            });

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

    const handleQuantityChange = (id, value) => {
        setQuantityEdits((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleUpdateQuantity = async (id) => {
        try {
            const nextQuantity = Number(quantityEdits[id]);
            if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
                toast.error("Quantity must be a positive number");
                return;
            }

            setSavingQuantityId(id);
            const { data } = await API.put(`/request/update-quantity/${id}`, {
                quantity: nextQuantity,
            });

            if (data?.success) {
                toast.success(data.message);
                getRequests();
            } else {
                toast.error(data.message || "Unable to update quantity");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setSavingQuantityId(null);
        }
    };

    const handleDownloadBill = (record) => {
        const doc = new jsPDF();
        const quantityValue = record.quantity ?? 0;

        doc.setFontSize(16);
        doc.text("Blood Request Bill", 20, 20);

        doc.setFontSize(11);
        const lines = [
            `Bill ID: ${record._id}`,
            `Generated: ${moment().format("DD/MM/YYYY hh:mm A")}`,
            `Requester: ${record.hospital ? record.hospital.hospitalName : record.name}`,
            `Phone: ${record.hospital ? record.hospital.phone : record.phone}`,
            `Blood Group: ${record.bloodGroup || "N/A"}`,
            `Quantity: ${quantityValue} Unit(s)`,
            `Status: ${record.status || "N/A"}`,
            `Payment Status: ${record.paymentStatus || "non-paid"}`,
        ];

        lines.forEach((line, index) => {
            doc.text(line, 20, 35 + index * 8);
        });

        doc.save(`bill-${record._id}.pdf`);
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h2 className="text-center mb-4">
                    {user?.role === "organisation" ? "Hospital Supply Requests" : "Blood Requests"}
                </h2>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="input-group">
                        <span className="input-group-text bg-white">
                            <i className="fa-solid fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by hospital, blood group, phone, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => setSearchTerm("")}
                                title="Clear search"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Requester</th>
                            <th scope="col">Blood Group</th>
                            <th scope="col">
                                {user?.role === "hospital" ? "Quantity (Units)" : "Quantity (ML)"}
                            </th>
                            <th scope="col">Phone</th>
                            <th scope="col">Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Paid</th>
                            <th scope="col">Document</th>
                            {(user?.role === "hospital" || user?.role === "organisation") && (
                                <th scope="col">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData?.length > 0 ? (
                            filteredData.map((record) => (
                                <tr key={record._id}>
                                    <td>
                                        {record.hospital ? record.hospital.hospitalName : record.name}
                                    </td>
                                    <td>{record.bloodGroup}</td>
                                    <td>
                                        {user?.role === "hospital" ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control form-control-sm"
                                                    style={{ maxWidth: "120px" }}
                                                    value={quantityEdits[record._id] ?? ""}
                                                    onChange={(e) => handleQuantityChange(record._id, e.target.value)}
                                                />
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => handleUpdateQuantity(record._id)}
                                                    disabled={
                                                        savingQuantityId === record._id ||
                                                        Number(quantityEdits[record._id]) === Number(record.quantity) ||
                                                        !Number(quantityEdits[record._id])
                                                    }
                                                >
                                                    {savingQuantityId === record._id ? "Saving..." : "Update"}
                                                </button>
                                            </div>
                                        ) : (
                                            record.quantity ? `${record.quantity} ML` : "N/A"
                                        )}
                                    </td>
                                    <td>{record.hospital ? record.hospital.phone : record.phone}</td>
                                    <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                    <td>
                                        <span className="badge bg-warning text-dark">{record.status}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${record.paymentStatus === "paid" ? "bg-success" : "bg-secondary"}`}>
                                            {record.paymentStatus || "non-paid"}
                                        </span>
                                    </td>
                                    <td>
                                        {record.attachment ? (
                                            <a
                                                href={`http://localhost:5000${record.attachment}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-info text-white"
                                            >
                                                View Doc
                                            </a>
                                        ) : "N/A"}
                                    </td>
                                    {user?.role === "organisation" && (
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleFulfill(record._id)}
                                            >
                                                Send Blood
                                            </button>
                                        </td>
                                    )}
                                    {user?.role === "hospital" && (
                                        <td>
                                            {record.hospital ? (
                                                <span className="text-muted">N/A</span>
                                            ) : (
                                                <div className="d-flex gap-2">
                                                    {record.paymentStatus !== "paid" && (
                                                        <button
                                                            className="btn btn-outline-success btn-sm"
                                                            onClick={() => handleMarkPaid(record._id)}
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => handleDownloadBill(record)}
                                                        disabled={record.paymentStatus !== "paid"}
                                                        title={record.paymentStatus !== "paid" ? "Mark paid to enable bill" : "Download bill"}
                                                    >
                                                        Download Bill
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={user?.role === "hospital" || user?.role === "organisation" ? 9 : 8} className="text-center text-muted py-4">
                                    {searchTerm ? (
                                        <>
                                            <i className="fa-solid fa-search me-2"></i>
                                            No results found for "{searchTerm}"
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-inbox me-2"></i>
                                            No active requests found
                                        </>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default BloodRequests;
