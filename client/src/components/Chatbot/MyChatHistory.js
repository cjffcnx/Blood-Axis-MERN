import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getMyChatHistory } from "../../services/chatHistoryAPI";

const MyChatHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await getMyChatHistory();
            if (data?.success) {
                setHistory(data.data || []);
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
        loadHistory();
    }, []);

    return (
        <div className="container mt-4">
            <h4 className="mb-3">My Chat History</h4>
            {loading ? (
                <p>Loading...</p>
            ) : history.length === 0 ? (
                <p className="text-muted">No chat history yet</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Response</th>
                                <th>Type</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item._id}>
                                    <td style={{ maxWidth: 220 }}>{item.query}</td>
                                    <td style={{ maxWidth: 360 }}>{item.response}</td>
                                    <td>{item.queryType}</td>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyChatHistory;
