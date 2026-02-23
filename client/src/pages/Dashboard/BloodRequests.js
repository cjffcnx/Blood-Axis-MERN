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
    const [unitsUsedEdits, setUnitsUsedEdits] = useState({});
    const [savingUnitsUsedId, setSavingUnitsUsedId] = useState(null);

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

        setUnitsUsedEdits((prev) => {
            const next = { ...prev };
            data.forEach((record) => {
                if (next[record._id] === undefined) {
                    next[record._id] = record.unitsUsed ?? 0;
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

    const handleUnitsUsedChange = (id, value) => {
        setUnitsUsedEdits((prev) => ({
            ...prev,
            [id]: Number(value),
        }));
    };

    const handleUpdateUnitsUsed = async (id) => {
        try {
            const unitsUsed = Number(unitsUsedEdits[id]);
            const record = data.find(r => r._id === id);

            if (!Number.isFinite(unitsUsed) || unitsUsed < 0) {
                toast.error("Units used must be a non-negative number");
                return;
            }

            if (unitsUsed > record.quantity) {
                toast.error(`Units used cannot exceed requested quantity (${record.quantity})`);
                return;
            }

            setSavingUnitsUsedId(id);
            const { data: responseData } = await API.put(`/request/update-units-used/${id}`, {
                unitsUsed,
            });

            if (responseData?.success) {
                toast.success(responseData.message);
                getRequests();
            } else {
                toast.error(responseData.message || "Unable to update units used");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setSavingUnitsUsedId(null);
        }
    };

    const handleDownloadBill = (record) => {
        const doc = new jsPDF();
        const quantityValue = record.quantity ?? 0;
        const paymentAmount = record.paymentAmount || 0;
        const unitsUsed = record.unitsUsed || 0;
        const amountUsed = unitsUsed * 400;
        const finalAmount = paymentAmount - amountUsed;

        doc.setFontSize(16);
        doc.text("Blood Request Bill", 20, 20);

        doc.setFontSize(11);
        const lines = [
            `Bill ID: ${record._id}`,
            `Generated: ${moment().format("DD/MM/YYYY hh:mm A")}`,
            `Requester: ${record.hospital ? record.hospital.hospitalName : record.name}`,
            `Phone: ${record.hospital ? record.hospital.phone : record.phone}`,
            `Blood Group: ${record.bloodGroup || "N/A"}`,
            `Quantity Requested: ${quantityValue} Unit(s)`,
            `Units Used: ${unitsUsed} Unit(s)`,
            `Status: ${record.status || "N/A"}`,
            `Payment Status: ${record.paymentStatus || "non-paid"}`,
            paymentAmount > 0 ? `Amount Paid: Rs ${paymentAmount}` : null,
            unitsUsed > 0 ? `Amount Used: Rs ${amountUsed}` : null,
            paymentAmount > 0 ? `Final Amount (Difference): Rs ${finalAmount}` : null,
        ].filter(Boolean);

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
                            <th scope="col">Amount Paid</th>
                            {user?.role === "hospital" && (
                                <>
                                    <th scope="col">Units Used</th>
                                    <th scope="col">Amount Used</th>
                                    <th scope="col">Final Amount</th>
                                    <th scope="col">Document</th>
                                </>
                            )}
                            {user?.role === "organisation" && <th scope="col">Action</th>}
                            {user?.role === "hospital" && <th scope="col">Action</th>}
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
                                        {user?.role === "hospital"
                                            ? (record.quantity ? `${record.quantity} Units` : "N/A")
                                            : (record.quantity ? `${record.quantity} ML` : "N/A")
                                        }
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
                                        {record.paymentAmount && record.paymentAmount > 0
                                            ? `Rs ${record.paymentAmount}`
                                            : "-"}
                                    </td>
                                    {user?.role === "hospital" && (
                                        <>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        style={{ maxWidth: "100px" }}
                                                        value={unitsUsedEdits[record._id] ?? 0}
                                                        onChange={(e) => handleUnitsUsedChange(record._id, e.target.value)}
                                                        disabled={savingUnitsUsedId === record._id}
                                                    >
                                                        {Array.from({ length: (record.quantity || 0) + 1 }, (_, i) => (
                                                            <option key={i} value={i}>{i}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => handleUpdateUnitsUsed(record._id)}
                                                        disabled={
                                                            savingUnitsUsedId === record._id ||
                                                            Number(unitsUsedEdits[record._id]) === Number(record.unitsUsed || 0)
                                                        }
                                                    >
                                                        {savingUnitsUsedId === record._id ? "..." : "✓"}
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                {`Rs ${(unitsUsedEdits[record._id] || 0) * 400}`}
                                            </td>
                                            <td>
                                                {(() => {
                                                    const amountPaid = record.paymentAmount || 0;
                                                    const amountUsed = (unitsUsedEdits[record._id] || 0) * 400;
                                                    const finalAmount = amountPaid - amountUsed;
                                                    const color = finalAmount > 0 ? "text-success" : finalAmount < 0 ? "text-danger" : "";
                                                    return <span className={color}>Rs {finalAmount}</span>;
                                                })()}
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
                                        </>
                                    )}
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
                                <td colSpan={user?.role === "hospital" ? 13 : user?.role === "organisation" ? 9 : 8} className="text-center text-muted py-4">
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
