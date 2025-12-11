import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";


const BloodRequests = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);

    //get requests based on role
    const getRequests = async () => {
        try {
            if (user?.role === "organisation") {
                const { data } = await API.get("/request/hospital-requests");
                if (data?.success) {
                    setData(data?.requests);
                }
            } else {
                // Default logic for others
                const { data } = await API.get("/request/get-approved-requests");
                if (data?.success) {
                    setData(data?.requests);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getRequests();
    }, [user]);

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

    return (
        <Layout>
            <div className="container mt-4">
                <h2 className="text-center mb-4">
                    {user?.role === "organisation" ? "Hospital Supply Requests" : "Blood Requests"}
                </h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Requester</th>
                            <th scope="col">Blood Group</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Paid</th>
                            {user?.role === "organisation" && <th scope="col">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>
                                    {record.hospital ? record.hospital.hospitalName : record.name}
                                </td>
                                <td>{record.bloodGroup}</td>
                                <td>{record.quantity ? `${record.quantity} ML` : 'N/A'}</td>
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
                            </tr>
                        ))}
                        {data?.length === 0 && (
                            <tr>
                                <td colSpan={user?.role === "organisation" ? 8 : 7} className="text-center">No active requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default BloodRequests;
