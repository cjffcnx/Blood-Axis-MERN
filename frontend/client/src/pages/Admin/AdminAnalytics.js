import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const CHART_COLORS = ["#1976d2", "#2e7d32", "#f57c00", "#7b1fa2", "#c2185b", "#0288d1"];

const AdminAnalytics = () => {
    const [providers, setProviders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState("all");

    const getAdminAnalytics = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/analytics/admin-overview");
            if (data?.success) {
                setProviders(data.providers || []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAdminAnalytics();
    }, []);

    const filteredProviders = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        let roleScopedProviders = providers;

        if (roleFilter === "hospital") {
            roleScopedProviders = providers.filter((provider) => provider.role === "hospital");
        }

        if (roleFilter === "organisation") {
            roleScopedProviders = providers.filter((provider) => provider.role === "organisation");
        }

        if (!query) return roleScopedProviders;

        return roleScopedProviders.filter((provider) => {
            const searchable = [
                provider.name,
                provider.role,
                provider.email,
                provider.phone,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const bloodGroupMatch = (provider.bloodGroupData || []).some((item) =>
                item.bloodGroup?.toLowerCase().includes(query)
            );

            return searchable.includes(query) || bloodGroupMatch;
        });
    }, [providers, searchTerm, roleFilter]);

    const summary = useMemo(() => {
        return filteredProviders.reduce(
            (acc, provider) => {
                acc.totalProviders += 1;
                if (provider.role === "organisation") acc.organisations += 1;
                if (provider.role === "hospital") acc.hospitals += 1;
                acc.totalIn += provider.totals?.totalIn || 0;
                acc.totalOut += provider.totals?.totalOut || 0;
                acc.available += provider.totals?.availabeBlood || 0;
                return acc;
            },
            {
                totalProviders: 0,
                organisations: 0,
                hospitals: 0,
                totalIn: 0,
                totalOut: 0,
                available: 0,
            }
        );
    }, [filteredProviders]);

    const rows = useMemo(() => {
        return filteredProviders.flatMap((provider) =>
            (provider.bloodGroupData || []).map((item) => ({
                providerId: provider.providerId,
                name: provider.name,
                role: provider.role,
                bloodGroup: item.bloodGroup,
                totalIn: item.totalIn,
                totalOut: item.totalOut,
                availabeBlood: item.availabeBlood,
            }))
        );
    }, [filteredProviders]);

    const bloodGroupChartData = useMemo(() => {
        const aggregation = new Map();

        rows.forEach((row) => {
            const current = aggregation.get(row.bloodGroup) || {
                bloodGroup: row.bloodGroup,
                totalIn: 0,
                totalOut: 0,
                available: 0,
            };
            current.totalIn += row.totalIn || 0;
            current.totalOut += row.totalOut || 0;
            current.available += row.availabeBlood || 0;
            aggregation.set(row.bloodGroup, current);
        });

        return Array.from(aggregation.values());
    }, [rows]);

    const roleChartData = useMemo(() => {
        return [
            { name: "Hospitals", value: summary.hospitals },
            { name: "Organisations", value: summary.organisations },
        ].filter((item) => item.value > 0);
    }, [summary]);

    return (
        <Layout>
            <div className="container mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h3 className="mb-0">Admin Analytics Monitor</h3>
                    <div className="d-flex flex-wrap gap-2" style={{ maxWidth: "720px", width: "100%" }}>
                        <div className="btn-group" role="group" aria-label="Role filter">
                            <button
                                type="button"
                                className={`btn ${roleFilter === "all" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => setRoleFilter("all")}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                className={`btn ${roleFilter === "hospital" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => setRoleFilter("hospital")}
                            >
                                Only Hospitals
                            </button>
                            <button
                                type="button"
                                className={`btn ${roleFilter === "organisation" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => setRoleFilter("organisation")}
                            >
                                Only Organisations
                            </button>
                        </div>

                        <div className="input-group" style={{ maxWidth: "420px" }}>
                            <span className="input-group-text bg-white">
                                <i className="fa-solid fa-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search hospital/organisation, role, email, phone, blood group"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-2 col-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <small className="text-muted">Providers</small>
                                <h5 className="mb-0">{summary.totalProviders}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <small className="text-muted">Organisations</small>
                                <h5 className="mb-0">{summary.organisations}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <small className="text-muted">Hospitals</small>
                                <h5 className="mb-0">{summary.hospitals}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <small className="text-muted">Total In</small>
                                <h5 className="mb-0">{summary.totalIn} ML</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <small className="text-muted">Total Out</small>
                                <h5 className="mb-0">{summary.totalOut} ML</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <small className="text-muted">Available</small>
                                <h5 className="mb-0">{summary.available} ML</h5>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <h5 className="card-title">Blood Group Analytics</h5>
                                <div style={{ width: "100%", height: 320 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={bloodGroupChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="bloodGroup" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="totalIn" fill="#2e7d32" name="Total In" />
                                            <Bar dataKey="totalOut" fill="#f57c00" name="Total Out" />
                                            <Bar dataKey="available" fill="#1976d2" name="Available" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <h5 className="card-title">Provider Mix</h5>
                                <div style={{ width: "100%", height: 320 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={roleChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                outerRadius={110}
                                                label
                                            >
                                                {roleChartData.map((entry, index) => (
                                                    <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Provider</th>
                                        <th>Role</th>
                                        <th>Blood Group</th>
                                        <th>Total In</th>
                                        <th>Total Out</th>
                                        <th>Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">Loading analytics...</td>
                                        </tr>
                                    ) : rows.length > 0 ? (
                                        rows.map((row) => (
                                            <tr key={`${row.providerId}-${row.bloodGroup}`}>
                                                <td>{row.name}</td>
                                                <td className="text-capitalize">{row.role}</td>
                                                <td>{row.bloodGroup}</td>
                                                <td>{row.totalIn} ML</td>
                                                <td>{row.totalOut} ML</td>
                                                <td>{row.availabeBlood} ML</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                No analytics found for your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminAnalytics;
