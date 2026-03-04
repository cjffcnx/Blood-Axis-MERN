import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllChatHistory } from "../../services/chatHistoryAPI";

const AdminChatHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadHistory = async (pageToLoad = 1) => {
        try {
            setLoading(true);
            const data = await getAllChatHistory(pageToLoad, 20);
            if (data?.success) {
                setHistory(data.data || []);
                setPage(data.pagination?.currentPage || pageToLoad);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                toast.error(data?.message || "Failed to load chat history");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to load chat history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory(page);
    }, [page]);

    return (
        <div className="container mt-4">
            <h4 className="mb-3">All Chat History</h4>
            {loading ? (
                <p>Loading...</p>
            ) : history.length === 0 ? (
                <p className="text-muted">No chat history found</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Question</th>
                                <th>Response</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.userName}</td>
                                    <td>{item.userRole}</td>
                                    <td style={{ maxWidth: 200 }}>{item.query}</td>
                                    <td style={{ maxWidth: 320 }}>{item.response}</td>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="d-flex align-items-center gap-2 mt-3">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                    Previous
                </button>
                <span>
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminChatHistory;
