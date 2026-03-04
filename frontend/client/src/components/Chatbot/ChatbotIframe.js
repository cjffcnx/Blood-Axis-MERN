import React from "react";
import ChatbotPanel from "./ChatbotPanel";

const ChatbotIframe = () => {
    return (
        <div className="container mt-4" style={{ maxWidth: 900 }}>
            <ChatbotPanel showHeader={true} />
        </div>
    );
};

export default ChatbotIframe;
