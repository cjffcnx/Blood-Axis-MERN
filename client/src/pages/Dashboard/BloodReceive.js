import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { toast } from "react-toastify";
import '../../styles/blood-receive.css';

const BloodReceive = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    //get requests
    const getRequests = async () => {
        try {
            console.log("Fetching blood receive requests...");
            const { data } = await API.get("/request/my-requests");
            console.log("API Response:", data);
            if (data?.success) {
                console.log("Requests data:", data?.requests);
                setData(data?.requests);
            }
        } catch (error) {
            console.log("Error fetching requests:", error);
            console.error("Full error:", error.response || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            let answer = window.confirm("Are you sure you want to approve and receive this blood shipment?");
            if (!answer) return;

            const { data } = await API.put(`/request/approve/${id}`);
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

    const handleReject = async (id) => {
        try {
            let answer = window.confirm("Are you sure you want to reject this blood shipment?");
            if (!answer) return;

            const { data } = await API.put(`/request/reject/${id}`);
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

    return (
        <Layout>
            <div className="blood-receive-page">
                <div className="container">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="text-center mb-4 text-primary">Incoming Blood Supply</h3>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Loading requests...</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th scope="col">Blood Group</th>
                                                <th scope="col">Quantity (ML)</th>
                                                <th scope="col">Organisation</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Phone</th>
                                                <th scope="col">Date</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.map((record) => (
                                                <tr key={record._id}>
                                                    <td><span className="fw-bold">{record.bloodGroup}</span></td>
                                                    <td>{record.quantity ? record.quantity : 'N/A'}</td>
                                                    <td>
                                                        {record.organisation ?
                                                            record.organisation.organisationName :
                                                            <span className="text-muted fst-italic">Not assigned</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        {record.organisation?.email || <span className="text-muted">-</span>}
                                                    </td>
                                                    <td>
                                                        {record.organisation?.phone || <span className="text-muted">-</span>}
                                                    </td>
                                                    <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                                    <td>
                                                        <span className={`badge ${record.status === 'completed' ? 'bg-success' :
                                                                record.status === 'fulfilled' ? 'bg-info' :
                                                                    record.status === 'rejected' ? 'bg-danger' :
                                                                        'bg-warning'
                                                            }`}>
                                                            {record.status === 'fulfilled' ? 'In Transit' :
                                                                record.status === 'completed' ? 'Approved' :
                                                                    record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {record.status === 'fulfilled' && (
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-success btn-sm rounded-pill px-3"
                                                                    onClick={() => handleApprove(record._id)}
                                                                >
                                                                    <i className="fa-solid fa-check"></i> Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm rounded-pill px-3"
                                                                    onClick={() => handleReject(record._id)}
                                                                >
                                                                    <i className="fa-solid fa-times"></i> Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                        {record.status === 'completed' && (
                                                            <span className="text-success fw-bold"><i className="fa-solid fa-circle-check"></i> Received</span>
                                                        )}
                                                        {record.status === 'rejected' && (
                                                            <span className="text-danger fw-bold"><i className="fa-solid fa-circle-xmark"></i> Rejected</span>
                                                        )}
                                                        {record.status === 'pending' && (
                                                            <span className="text-muted">Awaiting Supply</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {data?.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4 text-muted">No incoming blood requests found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BloodReceive;
