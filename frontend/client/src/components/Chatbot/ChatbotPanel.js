import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { askChatbot } from "../../services/chatbotAPI";
import { saveChatHistory } from "../../services/chatHistoryAPI";

const ChatbotPanel = ({ onClose, showHeader = true }) => {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastExchange, setLastExchange] = useState(null);
    const messagesEndRef = useRef(null);
    const sessionIdRef = useRef(`chat-session-${Date.now()}`);

    const displayName = useMemo(() => {
        return user?.name || user?.hospitalName || user?.organisationName || "Anonymous";
    }, [user]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setInput("");
        setLoading(true);

        try {
            const data = await askChatbot(trimmed, "text");
            if (data?.success) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
                setLastExchange({
                    query: trimmed,
                    response: data.response,
                    metadata: data.metadata || {},
                    queryType: "text",
                });
            } else {
                toast.error(data?.message || "Failed to get response");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to get response");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLast = async () => {
        if (!lastExchange) {
            toast.warn("No conversation to save yet");
            return;
        }

        try {
            const data = await saveChatHistory(
                lastExchange.query,
                lastExchange.response,
                user?._id || null,
                lastExchange.queryType,
                sessionIdRef.current,
                lastExchange.metadata
            );

            if (data?.success) {
                toast.success("Conversation saved!");
            } else {
                toast.error(data?.message || "Failed to save conversation");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to save conversation");
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="d-flex flex-column h-100">
            {showHeader && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <h5 className="mb-0">AI Chatbot</h5>
                        <small className="text-muted">Welcome, {displayName}</small>
                    </div>
                    {onClose && (
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>
            )}

            <div className="border rounded p-3 mb-3 flex-grow-1 overflow-auto" style={{ background: "#fff" }}>
                {messages.length === 0 ? (
                    <p className="text-muted mb-0">Ask a question to get started.</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={`${msg.role}-${index}`}
                            className={`mb-2 d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                        >
                            <div
                                className={`p-2 rounded ${msg.role === "user" ? "bg-danger text-white" : "bg-light"}`}
                                style={{ maxWidth: "80%", whiteSpace: "pre-wrap" }}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="mb-2">
                <textarea
                    className="form-control"
                    rows="2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..."
                    disabled={loading}
                />
            </div>

            <div className="d-flex gap-2">
                <button type="button" className="btn btn-danger" onClick={handleSend} disabled={loading}>
                    {loading ? "Thinking..." : "Send"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleSaveLast}>
                    Save Last Conversation
                </button>
            </div>
        </div>
    );
};

export default ChatbotPanel;
