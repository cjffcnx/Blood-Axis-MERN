import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { toast } from "react-toastify";

const RequestList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    //get all requests
    const getRequests = async (searchValue = "") => {
        try {
            setLoading(true);
            const params = {};
            if (searchValue.trim()) {
                params.search = searchValue.trim();
            }
            const { data } = await API.get("/request/get-requests", { params });
            if (data?.success) {
                setData(data?.requests || []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            getRequests(searchTerm);
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    // Update Status
    const handleStatusUpdate = async (id, status) => {
        try {
            const { data } = await API.put(`/request/update-status/${id}`, { status });
            if (data?.success) {
                toast.success(`Request ${status} successfully`);
                getRequests();
            }
        } catch (error) {
            console.log(error);
            toast.error("Error updating status");
        }
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Manage Blood Requests</h2>
                <div className="mb-4">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fa-solid fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search name, email, phone, blood group, hospital, or status"
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
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>
                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        No requests found.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Blood Group</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Hospital</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Document</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((record) => (
                                    <tr key={record._id}>
                                        <td>{record.name}</td>
                                        <td>{record.bloodGroup}</td>
                                        <td>{record.phone}</td>
                                        <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                        <td>{record.hospitalName || "N/A"}</td>
                                        <td>
                                            <span className={`badge ${record.status === 'pending' ? 'bg-warning' : record.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                                                {record.status}
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
                                            ) : 'N/A'}
                                        </td>
                                        <td>
                                            {record.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-success btn-sm me-2"
                                                        onClick={() => handleStatusUpdate(record._id, 'approved')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleStatusUpdate(record._id, 'rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {record.status !== 'pending' && (
                                                <span className="text-muted">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RequestList;
