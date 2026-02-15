import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { toast } from "react-toastify";

const AccountRequests = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

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

            const { data } = await API.put(`/account-requests/${id}/status`, {
                status,
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
                                        href={`${window.location.protocol}//${window.location.hostname}:5000/${record.proofFile.replace(/\\/g, "/")}`}
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
                                        onClick={() => handleStatus(record._id, "rejected")}
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
            </div>
        </Layout>
    );
};

export default AccountRequests;
