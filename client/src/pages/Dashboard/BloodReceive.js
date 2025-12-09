import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { toast } from "react-toastify";
import '../../styles/blood-receive.css';

const BloodReceive = () => {
    const [data, setData] = useState([]);

    //get requests
    const getRequests = async () => {
        try {
            const { data } = await API.get("/request/my-requests");
            if (data?.success) {
                setData(data?.requests);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getRequests();
    }, []);

    const handleConfirm = async (id) => {
        try {
            let answer = window.confirm("Have you received the blood shipment? This will confirm the transaction.");
            if (!answer) return;

            const { data } = await API.put(`/request/confirm/${id}`);
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

    return (
        <Layout>
            <div className="blood-receive-page">
                <div className="container">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="text-center mb-4 text-primary">Incoming Blood Supply</h3>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">Blood Group</th>
                                            <th scope="col">Quantity</th>
                                            <th scope="col">Organisation</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.map((record) => (
                                            <tr key={record._id}>
                                                <td><span className="fw-bold">{record.bloodGroup}</span></td>
                                                <td>{record.quantity ? `${record.quantity} ML` : 'N/A'}</td>
                                                <td>
                                                    {record.organisation ?
                                                        record.organisation.organisationName :
                                                        <span className="text-muted fst-italic">Not yet assigned</span>
                                                    }
                                                </td>
                                                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                                <td>
                                                    <span className={`badge ${record.status === 'completed' ? 'bg-success' : record.status === 'fulfilled' ? 'bg-info' : 'bg-warning'}`}>
                                                        {record.status === 'fulfilled' ? 'In Transit' : record.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {record.status === 'fulfilled' && (
                                                        <button
                                                            className="btn btn-primary btn-sm rounded-pill px-3"
                                                            onClick={() => handleConfirm(record._id)}
                                                        >
                                                            Confirm Receipt
                                                        </button>
                                                    )}
                                                    {record.status === 'completed' && (
                                                        <span className="text-success fw-bold"><i className="fa-solid fa-circle-check"></i> Received</span>
                                                    )}
                                                    {record.status === 'pending' && (
                                                        <span className="text-muted">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {data?.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">No incoming blood requests found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BloodReceive;
