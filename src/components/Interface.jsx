import { useState, useRef, useEffect } from "react";
import { LatexRenderer } from "./LatexRenderer";

export const Interface = ({ messages, onSendMessage, isMobile }) => {
    const [inputValue, setInputValue] = useState("");
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
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

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onSendMessage(null, { type: "image", file });
        }
    };

    const toggleCamera = async () => {
        if (!isCameraOpen) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setCameraStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraOpen(true);
            } catch (err) {
                console.error("Camera access error:", err);
                alert("Impossible d'accéder à la caméra.");
            }
        } else {
            closeCamera();
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Safety check for dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                console.error("Video dimensions are 0");
                return;
            }

            const context = canvas.getContext('2d');

            // Limit max dimensions to prevent API errors
            const maxDim = 1536;
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    onSendMessage(null, { type: "image", file });
                    closeCamera();
                }
            }, 'image/jpeg', 0.85);
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
                                {msg.image && msg.sender === "user" && (
                                    <img
                                        src={msg.image}
                                        alt="Uploaded"
                                        style={{
                                            maxWidth: isMobile ? '200px' : '300px',
                                            maxHeight: isMobile ? '200px' : '300px',
                                            borderRadius: '8px',
                                            marginBottom: '10px'
                                        }}
                                    />
                                )}
                                {msg.text && <LatexRenderer text={msg.text} />}
                                {msg.showPracticeButtons && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        marginTop: '15px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <button
                                            onClick={() => {
                                                if (msg.exercisesData) {
                                                    onSendMessage("Oui, je veux m'entraîner", {
                                                        type: "practice_choice",
                                                        exercises: msg.exercisesData
                                                    });
                                                }
                                            }}
                                            className="btn btn-primary"
                                        >
                                            Oui, je veux m'entraîner !
                                        </button>
                                        <button
                                            onClick={() => onSendMessage("Non merci", {})}
                                            className="btn btn-secondary"
                                        >
                                            Non merci
                                        </button>
                                    </div>
                                )}
                                {msg.showNextQuestionButtons && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        marginTop: '15px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <button
                                            onClick={() => onSendMessage("yes", {
                                                type: "next_question",
                                                exercises: msg.exercisesData,
                                                nextIndex: msg.nextIndex
                                            })}
                                            className="btn btn-success"
                                        >
                                            Oui
                                        </button>
                                        <button
                                            onClick={() => onSendMessage("no", {
                                                type: "next_question",
                                                exercises: msg.exercisesData,
                                                nextIndex: msg.nextIndex
                                            })}
                                            className="btn btn-danger"
                                        >
                                            Non
                                        </button>
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
                        <button
                            onClick={toggleCamera}
                            className="icon-btn"
                            title="Take Photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
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
            {/* Camera Overlay */}
            {isCameraOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            borderRadius: '1.5rem',
                            boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                        }}
                    />
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '20px',
                        pointerEvents: 'auto'
                    }}>
                        <button onClick={capturePhoto} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                            Prendre la photo
                        </button>
                        <button onClick={closeCamera} className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                            Annuler
                        </button>
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            )}
        </div>
    );
};
