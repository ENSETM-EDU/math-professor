import { useState, useRef, useEffect } from "react";

export const Interface = ({ messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState("");
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue("");
        }
    };

    return (
        <div className="overlay">
            {/* Header */}
            <div className="header-card">
                <h1>Professeur de Math LAB</h1>
                <p>Interactive AI Education</p>
            </div>

            {/* Main Content Area */}
            <div className="chat-container">
                <div className="messages-list">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender}`}
                        >
                            <div className="message-box">
                                {msg.text}
                                {msg.isMath && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>
                                        <small style={{ color: '#64748b' }}>Génération du QCM sur le tableau...</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Section */}
            <div className="input-container">
                <div className="input-card">
                    <div className="icon-group">
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="icon-btn"
                            title="Upload Image/PDF"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" style={{ display: 'none' }} accept="image/*,.pdf" />

                        <button className="icon-btn" title="Voice Input">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                        </button>
                    </div>

                    <input
                        type="text"
                        className="text-input"
                        placeholder="Écrivez votre question ici..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />

                    <button
                        onClick={handleSend}
                        className="send-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
