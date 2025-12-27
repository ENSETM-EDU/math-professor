import { ContactShadows, Environment, OrbitControls, Sky, Html } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useMemo } from "react";
import * as THREE from "three";

export const Experience = ({ state = "idle", boardContent }) => {
  return (
    <>
      <OrbitControls />
      <Sky />
      <Environment preset="sunset" />

      <group position={[0, -1, 0]}>
        <ContactShadows opacity={1} scale={10} blur={1} far={10} resolution={256} color="#000000" />

        {/* Avatar - Shifted to the right and back */}
        <group position={[1.5, 0, -1]}>
          <Avatar state={state} />
        </group>

        {/* Lab Desk - Positioned under the avatar */}
        <group position={[1.5, 0, -1]}>
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

        {/* Whiteboard / Screen - Shifted to the left */}
        <group position={[-1.2, 1.5, -0.5]}>
          <mesh>
            <planeGeometry args={[3.2, 2]} />
            <meshStandardMaterial color="white" />

            <Html
              transform
              distanceFactor={1.2}
              position={[0, 0, 0.01]}
            >
              <div style={{
                width: "500px",
                height: "300px",
                background: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "'Outfit', sans-serif",
                color: "#1e293b",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #e2e8f0"
              }}>
                <h2 style={{ margin: "0 0 15px 0", color: "#4f46e5", fontSize: "1.5rem" }}>{boardContent.title}</h2>
                <div style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", whiteSpace: "pre-wrap" }}>
                  {boardContent.equation}
                </div>
                <div style={{ marginTop: "15px", color: "#64748b", fontSize: "1rem" }}>
                  {boardContent.description}
                </div>
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
