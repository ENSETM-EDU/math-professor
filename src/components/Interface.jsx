import { useState, useRef, useEffect } from "react";
import { LatexRenderer } from "./LatexRenderer";

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

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onSendMessage(null, { type: "image", file });
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
                                            maxWidth: '300px',
                                            maxHeight: '300px',
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
                                            onClick={async () => {
                                                try {
                                                    console.log("Generating equation...");
                                                    // Generate equation with answers
                                                    const response = await fetch('http://localhost:8000/api/process-problem', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            input: `Tu DOIS répondre UNIQUEMENT avec un JSON valide, sans texte avant ou après. Format EXACT:
{
  "question": "$2x + 5 = 11$",
  "options": ["x = 3", "x = 6", "x = -3", "x = 8"],
  "correctAnswer": "x = 3"
}

Génère une équation mathématique simple avec 4 options de réponse. Une seule option est correcte. Utilise TOUJOURS le format LaTeX avec $ pour les équations. Réponds UNIQUEMENT avec le JSON, rien d'autre.`,
                                                            isImage: false,
                                                            history: []
                                                        })
                                                    });

                                                    if (!response.ok) {
                                                        console.error("API error:", response.status);
                                                        const errorData = await response.text();
                                                        console.error("Error details:", errorData);
                                                        return;
                                                    }

                                                    const data = await response.json();
                                                    console.log("Received data:", data);

                                                    // Try to parse equation from explanation
                                                    if (data && data.explanation) {
                                                        console.log("Explanation:", data.explanation);
                                                        const jsonMatch = data.explanation.match(/\{[\s\S]*\}/);
                                                        console.log("JSON match:", jsonMatch);
                                                        if (jsonMatch) {
                                                            const equation = JSON.parse(jsonMatch[0]);
                                                            console.log("Parsed equation:", equation);
                                                            onSendMessage("exercices", {
                                                                type: "practice_choice",
                                                                equation: equation
                                                            });
                                                        } else {
                                                            console.error("No JSON found in explanation");
                                                        }
                                                    } else {
                                                        console.error("No explanation in response");
                                                    }
                                                } catch (e) {
                                                    console.error("Failed to generate equation:", e);
                                                }
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#4f46e5',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Oui, une équation !
                                        </button>
                                        <button
                                            onClick={() => onSendMessage("Non merci", {})}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#64748b',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
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
                                            style={{
                                                padding: '10px 20px',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Oui
                                        </button>
                                        <button
                                            onClick={() => onSendMessage("no", {
                                                type: "next_question",
                                                exercises: msg.exercisesData,
                                                nextIndex: msg.nextIndex
                                            })}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
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
        </div>
    );
};
