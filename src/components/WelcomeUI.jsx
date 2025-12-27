import React from 'react';

export const WelcomeUI = ({ visible, onEnableSound }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
        }}>
            <div style={{
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: '400px',
                margin: '20px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>👋</div>
                <h2 style={{
                    margin: '0 0 10px 0',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '24px',
                    color: '#1e293b'
                }}>Bienvenue !</h2>
                <p style={{
                    marginBottom: '30px',
                    fontFamily: "'Outfit', sans-serif",
                    color: '#64748b',
                    lineHeight: '1.6'
                }}>
                    Le navigateur a bloqué le son automatique. Cliquez sur le bouton ci-dessous pour activer l'expérience.
                </p>
                <button
                    onClick={onEnableSound}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background-color 0.2s',
                        fontFamily: "'Outfit', sans-serif",
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4338ca';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4f46e5';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Activer le son 🔊
                </button>
            </div>
        </div>
    );
};
