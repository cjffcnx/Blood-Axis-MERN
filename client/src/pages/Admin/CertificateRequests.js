import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import { toast } from "react-toastify";
import API from "../../services/API";

const CertificateRequests = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch certificate requests from Google Sheet
    const getCertificateRequests = async () => {
        try {
            setLoading(true);
            // Since the certificate requests are in a Google Sheet, we'll display a link to it
            // and show donor information fetched from our database
            const { data } = await API.get("/admin/donar-list");
            if (data?.success) {
                // Filter donors with >= 8 donations (those eligible for certificates)
                const eligibleDonors = data?.donarData?.filter(
                    (donor) => donor.donationCount >= 8
                ) || [];
                setData(eligibleDonors);
            } else {
                toast.error(data?.message || "Failed to load donors");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error loading certificate requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCertificateRequests();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openOutlookCompose = (email) => {
        const composeUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}`;
        window.open(composeUrl, "_blank", "noopener,noreferrer");
    };

    const filteredData = data.filter(
        (donor) =>
            donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="mb-4">
                <h3 className="mb-3">Certificate Requests</h3>

                <div className="alert alert-info mb-3" role="alert">
                    <i className="fa-solid fa-info-circle"></i> View all certificate requests in the Google Sheet below.
                    Donors must have completed at least 8 donations to be eligible.
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-8">
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="fa-solid fa-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search donor name or email"
                                value={searchTerm}
                                onChange={handleSearch}
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
                    <div className="col-md-4">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() =>
                                window.open(
                                    "https://docs.google.com/spreadsheets/d/11UjSd_e9_pY15OftPhrD93__zJzKvTcI6uyQe1RpsqI/edit?resourcekey=&gid=1482418864#gid=1482418864",
                                    "_blank"
                                )
                            }
                        >
                            <i className="fa-solid fa-sheet-plastic"></i> Open Google Sheet
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        No eligible donors found. (Donors must have at least 8 donations)
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Donations</th>
                                    <th scope="col">Registration Date</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData?.map((donor) => (
                                    <tr key={donor._id}>
                                        <td>{donor.name || "N/A"}</td>
                                        <td>{donor.email}</td>
                                        <td>{donor.phone || "N/A"}</td>
                                        <td>
                                            <span className="badge bg-success">{donor.donationCount}</span>
                                        </td>
                                        <td>
                                            {new Date(donor.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-success me-2"
                                                onClick={() => openOutlookCompose(donor.email)}
                                                title="Send email"
                                            >
                                                <i className="fa-solid fa-envelope"></i> Email
                                            </button>
                                            <button
                                                className="btn btn-sm btn-info me-2"
                                                onClick={() =>
                                                    window.open(
                                                        "https://www.canva.com/design/DAHBklv5VSk/f_YMTh79RZDIZ3K8vpb9nw/edit",
                                                        "_blank"
                                                    )
                                                }
                                                title="Edit certificate on Canva"
                                            >
                                                <i className="fa-solid fa-palette"></i> Canva
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() =>
                                                    window.open(
                                                        "https://docs.google.com/spreadsheets/d/11UjSd_e9_pY15OftPhrD93__zJzKvTcI6uyQe1RpsqI/edit?resourcekey=&gid=1482418864#gid=1482418864",
                                                        "_blank"
                                                    )
                                                }
                                                title="View in spreadsheet"
                                            >
                                                <i className="fa-solid fa-external-link"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="card mt-4" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="card-body">
                        <h5 className="card-title">
                            <i className="fa-solid fa-circle-info"></i> Certificate Criteria
                        </h5>
                        <ul>
                            <li>
                                <strong>Minimum 8 Donations:</strong> Donors must have completed
                                at least 8 successful blood donations
                            </li>
                            <li>
                                <strong>Documentation:</strong> Donors must upload proof (photos
                                or documents) of all 8 donations in PDF format
                            </li>
                            <li>
                                <strong>Verification:</strong> All requests are recorded in the
                                Google Sheet for tracking and verification
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CertificateRequests;
