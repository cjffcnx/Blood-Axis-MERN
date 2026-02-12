import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const ChatbotWidget = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {open && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 90,
                        right: 24,
                        width: { xs: "92vw", sm: 380 },
                        height: 520,
                        bgcolor: "white",
                        borderRadius: 2,
                        boxShadow: 6,
                        overflow: "hidden",
                        zIndex: 1300,
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "error.main",
                            color: "white",
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            How may I help you?
                        </Typography>
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => setOpen(false)}
                            sx={{ color: "white", minWidth: "auto" }}
                        >
                            Close
                        </Button>
                    </Box>
                    <Box sx={{ height: "calc(100% - 48px)" }}>
                        <iframe
                            title="AI Chatbot"
                            src="https://sreejang-ai-rag-chatbot-voice-and-text.hf.space"
                            frameBorder="0"
                            width="100%"
                            height="100%"
                        />
                    </Box>
                </Box>
            )}

            <Box
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    zIndex: 1300,
                }}
            >
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => setOpen((prev) => !prev)}
                    sx={{
                        borderRadius: "999px",
                        minWidth: 56,
                        width: 56,
                        height: 56,
                        boxShadow: 6,
                    }}
                    aria-label="Open chatbot"
                >
                    <SmartToyIcon />
                </Button>
            </Box>
        </>
    );
};

export default ChatbotWidget;
