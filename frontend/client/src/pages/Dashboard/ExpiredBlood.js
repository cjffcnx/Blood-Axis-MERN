import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import { toast } from "react-toastify";

const disposalMethodOptions = [
    { value: "incineration", label: "Incineration" },
    { value: "biohazard", label: "Biohazard" },
    { value: "autoclave", label: "Autoclave" },
    { value: "chemical", label: "Chemical" },
    { value: "other", label: "Other" },
];

const ExpiredBlood = () => {
    const { user } = useSelector((state) => state.auth);
    const [expiredRecords, setExpiredRecords] = useState([]);
    const [disposedHistory, setDisposedHistory] = useState([]);
    const [expiryDays, setExpiryDays] = useState(42);
    const [selectedMethods, setSelectedMethods] = useState({});
    const [loadingRecordId, setLoadingRecordId] = useState(null);

    const getExpiredBlood = async () => {
        try {
            const { data } = await API.get("/inventory/expired-blood");
            if (data?.success) {
                setExpiredRecords(data?.expiredInventory || []);
                setExpiryDays(data?.expiryDays || 42);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getDisposedHistory = async () => {
        try {
            const { data } = await API.get("/inventory/disposed-history");
            if (data?.success) {
                setDisposedHistory(data?.disposedHistory || []);
                setExpiryDays(data?.expiryDays || 42);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleMethodChange = (recordId, method) => {
        setSelectedMethods((prev) => ({
            ...prev,
            [recordId]: method,
        }));
    };

    const handleDispose = async (recordId) => {
        const disposalMethod = selectedMethods[recordId] || "incineration";
        setLoadingRecordId(recordId);
        try {
            const { data } = await API.patch("/inventory/mark-disposed", {
                inventoryId: recordId,
                disposalMethod,
            });

            if (data?.success) {
                toast.success("Blood marked as disposed");
                await Promise.all([getExpiredBlood(), getDisposedHistory()]);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to dispose blood record");
        } finally {
            setLoadingRecordId(null);
        }
    };

    useEffect(() => {
        getExpiredBlood();
        getDisposedHistory();
    }, []);

    return (
        <Layout>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Expired Blood</h4>
                    <span className="badge bg-danger">
                        Expired after {expiryDays} days
                    </span>
                </div>

                <table className="table table-striped shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">Blood Group</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Donor / Source</th>
                            <th scope="col">Reason</th>
                            <th scope="col">Expired On</th>
                            <th scope="col">Disposal Method</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expiredRecords?.length > 0 ? (
                            expiredRecords.map((record) => {
                                const donorName =
                                    record?.donar?.name ||
                                    record?.organisation?.organisationName ||
                                    "N/A";

                                return (
                                    <tr key={record._id}>
                                        <td>
                                            <span className="badge bg-secondary">{record.bloodGroup}</span>
                                        </td>
                                        <td>{record.quantity} ML</td>
                                        <td>{donorName}</td>
                                        <td>{record.expiryReason || "Expired by policy"}</td>
                                        <td>{moment(record.expiresAt).format("DD/MM/YYYY")}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={selectedMethods[record._id] || "incineration"}
                                                onChange={(e) => handleMethodChange(record._id, e.target.value)}
                                            >
                                                {disposalMethodOptions.map((methodOption) => (
                                                    <option key={methodOption.value} value={methodOption.value}>
                                                        {methodOption.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                disabled={loadingRecordId === record._id}
                                                onClick={() => handleDispose(record._id)}
                                            >
                                                {loadingRecordId === record._id ? "Disposing..." : "Mark as Disposed"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-muted py-4">
                                    <i className="fa-solid fa-circle-check me-2"></i>
                                    No expired blood records found for {user?.role}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="d-flex justify-content-between align-items-center mb-3 mt-5">
                    <h4 className="mb-0">Disposed History</h4>
                    <span className="badge bg-secondary">{disposedHistory.length} records</span>
                </div>

                <table className="table table-striped shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">Blood Group</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Donor / Source</th>
                            <th scope="col">Reason</th>
                            <th scope="col">Expired On</th>
                            <th scope="col">Disposed On</th>
                            <th scope="col">Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disposedHistory?.length > 0 ? (
                            disposedHistory.map((record) => {
                                const donorName =
                                    record?.donar?.name ||
                                    record?.organisation?.organisationName ||
                                    "N/A";

                                return (
                                    <tr key={record._id}>
                                        <td>
                                            <span className="badge bg-secondary">{record.bloodGroup}</span>
                                        </td>
                                        <td>{record.quantity} ML</td>
                                        <td>{donorName}</td>
                                        <td>{record.expiryReason || "Expired by policy"}</td>
                                        <td>{moment(record.expiresAt).format("DD/MM/YYYY")}</td>
                                        <td>{moment(record.disposedAt).format("DD/MM/YYYY hh:mm A")}</td>
                                        <td className="text-capitalize">{record.disposalMethod || "N/A"}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-muted py-4">
                                    <i className="fa-solid fa-clock-rotate-left me-2"></i>
                                    No disposed history for {user?.role}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default ExpiredBlood;
