import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Interface } from "./components/Interface";
import { WelcomeUI } from "./components/WelcomeUI";
import { useWelcomeManager } from "./hooks/useWelcomeManager";
import { useState, useEffect } from "react";

function App() {
  const {
    state: welcomeState,
    needsClickToPlay,
    handleEnableSound,
    isAudioPlaying
  } = useWelcomeManager();

  const [manualState, setManualState] = useState(null);
  const [boardContent, setBoardContent] = useState({
    title: "Leçon du jour : Algèbre",
    equation: "x² + 2x + 1 = 0",
    description: "🎯 Identités Remarquables"
  });

  // Effective state: welcomeState takes priority if audio is playing, otherwise manualState or idle
  const currentState = isAudioPlaying ? welcomeState : (manualState || "idle");

  const handleMessage = (msg) => {
    if (msg === "CORRECT_ANSWER") {
      setManualState("celebrate");
      setTimeout(() => setManualState(null), 3000);
      return;
    }

    if (msg === "WRONG_ANSWER") {
      // For wrong answer, we just stay idle or some other variation
      setManualState("idle");
      return;
    }

    // Default: User sent a text message
    setManualState("talk");

    // Try to extract an equation or update board with user input
    if (msg.length < 50) {
      setBoardContent(prev => ({
        ...prev,
        equation: msg
      }));
    }

    setTimeout(() => setManualState(null), 3000);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <WelcomeUI
        visible={needsClickToPlay}
        onEnableSound={handleEnableSound}
      />

      <Canvas shadows camera={{ position: [0, 2, 7], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience state={currentState} boardContent={boardContent} />
      </Canvas>

      <Interface onSendMessage={handleMessage} />
    </div>
  );
}

export default App;
