import { ContactShadows, Environment, OrbitControls, Sky, Html } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { Qcm } from "./Qcm";
import { useMemo } from "react";
import * as THREE from "three";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const Experience = ({ state = "idle", boardContent, onSendMessage, isMobile }) => {
  return (
    <>
      <OrbitControls />
      <Sky />
      <Environment preset="sunset" />

      <group position={[0, -1, 0]}>
        <ContactShadows opacity={1} scale={10} blur={1} far={10} resolution={256} color="#000000" />

        {/* Avatar - Front and right on mobile, far right on desktop */}
        <group position={isMobile ? [1, -0.4, 1.5] : [1.5, 0, -1]}>
          <Avatar state={state} />
        </group>

        {/* Lab Desk - Positioned under the avatar */}
        <group position={isMobile ? [1, -0.4, 1.5] : [1.5, 0, -1]}>
          <mesh position={[0, 0.4, 0.6]}>
            <boxGeometry args={[1.5, 0.05, 1]} />
            <meshStandardMaterial color="#4a3728" roughness={0.5} />
          </mesh>
          <mesh position={[-0.7, 0.2, 0.6]}>
            <boxGeometry args={[0.05, 0.4, 0.8]} />
            <meshStandardMaterial color="#3a2718" />
          </mesh>
          <mesh position={[0.7, 0.2, 0.6]}>
            <boxGeometry args={[0.05, 0.4, 0.8]} />
            <meshStandardMaterial color="#3a2718" />
          </mesh>
        </group>

        {/* Whiteboard / Screen - Back and centered on mobile, left on desktop */}
        <group position={isMobile ? [0, 1.5, -0.5] : [-1.2, 1.5, -0.5]}>
          <mesh>
            <planeGeometry args={[3.2, 2]} />
            <meshStandardMaterial color="white" />

            <Html
              transform
              distanceFactor={isMobile ? 1 : 1.2}
              position={[0, 0, 0.01]}
            >
              <div style={{
                width: isMobile ? "600px" : "800px",
                height: isMobile ? "400px" : "500px",
                background: "transparent", // Made transparent
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start", // Always start from top now
                alignItems: "center",
                fontFamily: "'Outfit', sans-serif",
                color: "#1e293b",
                padding: isMobile ? "10px 20px" : "20px 40px", // Reduced top padding
                borderRadius: "0",
                boxSizing: "border-box",
                overflow: 'hidden'
              }}>
                {boardContent.qcm ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    transform: boardContent.qcm.type === "equation_quiz" ? 'scale(1.1)' : 'scale(1.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {boardContent.qcm.type === "equation_quiz" ? (
                      // Display equation with multiple choice answers
                      <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '2.5rem' : '3rem',
                          fontWeight: 'bold',
                          color: '#4f46e5',
                          marginBottom: '10px'
                        }}>
                          <BlockMath math={boardContent.qcm.equation.replace(/\$/g, '')} />
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          width: '80%'
                        }}>
                          {boardContent.qcm.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => onSendMessage(option, { type: "qcm_answer" })}
                              style={{
                                padding: isMobile ? '8px 12px' : '15px 25px',
                                fontSize: isMobile ? '0.9rem' : '1.2rem',
                                background: '#f1f5f9',
                                border: '3px solid #cbd5e1',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: '600',
                                color: '#1e293b'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#dbeafe';
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#f1f5f9';
                                e.target.style.borderColor = '#cbd5e1';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Qcm
                        question={boardContent.qcm.question}
                        options={boardContent.qcm.options}
                        flat={true}
                        isLast={true}
                        onAnswer={(ans) => {
                          onSendMessage(ans, { type: "qcm_answer" });
                        }}
                        onNext={() => {
                          // Clear board or move to next
                          onSendMessage("NEXT_STEP");
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    {boardContent.title && (
                      <h2 style={{ margin: "0 0 20px 0", color: "#4f46e5", fontSize: "2.5rem" }}>{boardContent.title}</h2>
                    )}

                    <div style={{
                      fontSize: isMobile ? "3.5rem" : ((boardContent.title || boardContent.description) ? "2.2rem" : "3rem"),
                      fontWeight: "bold",
                      color: "#1e293b",
                      whiteSpace: "pre-wrap",
                      width: "100%",
                      transform: isMobile ? 'scale(1.3)' : 'none'
                    }}>
                      {boardContent.equation && boardContent.equation.trim() !== '' ? (
                        (boardContent.equation.includes('$') || boardContent.equation.includes('\\')) ? (
                          <BlockMath math={boardContent.equation.replace(/^\$\$?|\$\$?$/g, '')} />
                        ) : (
                          boardContent.equation
                        )
                      ) : null}
                    </div>

                    {boardContent.description && (
                      <div style={{ marginTop: "20px", color: "#64748b", fontSize: "1.5rem" }}>
                        {boardContent.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Html>
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[3.4, 2.2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>

        {/* Floor */}
        <mesh scale={20} rotation-x={-Math.PI * 0.5} position-y={-0.001}>
          <planeGeometry />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      </group>
    </>
  );
};
