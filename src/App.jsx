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
    description: "🎯 Identités Remarquables",
    qcm: null
  });

  const [messages, setMessages] = useState([
    {
      text: "Bonjour ! Je suis votre professeur de mathématiques. Comment puis-je vous aider aujourd'hui ? Vous pouvez m'envoyer une photo de votre exercice ou une question.",
      sender: "teacher",
    },
  ]);

  // Effective state: welcomeState takes priority if audio is playing, otherwise manualState or idle
  const currentState = isAudioPlaying ? welcomeState : (manualState || "idle");

  const handleMessage = (msg, data) => {
    // 1. Handle QCM Answer from Board
    if (data?.type === "qcm_answer") {
      const ans = msg;
      setMessages(prev => [...prev, { text: `Ma réponse : ${ans}`, sender: "user" }]);

      const isCorrect = ans === boardContent.qcm?.answer;

      setManualState(isCorrect ? "celebrate" : "idle");

      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: isCorrect ? "Bravo ! C'est exactement ça. Tu as bien compris le concept." : "Pas tout à fait. Réfléchis encore : l'identité (x+1)² est le résultat de x² + 2x + 1.",
          sender: "teacher"
        }]);
        setManualState(null);
      }, 1000);
      return;
    }

    if (msg === "NEXT_STEP") {
      setBoardContent(prev => ({ ...prev, qcm: null }));
      return;
    }

    // 2. Handle Displaying a QCM on Board
    if (data?.type === "qcm") {
      setBoardContent(prev => ({
        ...prev,
        qcm: data
      }));
      return;
    }

    // 3. Handle Normal User Message
    if (typeof msg === "string") {
      setMessages(prev => [...prev, { text: msg, sender: "user" }]);
      setManualState("talk");

      // Mock Response Logic
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "C'est une excellente question sur les équations. Je vais analyser cela...",
          sender: "teacher"
        }]);

        setTimeout(() => {
          const qcmData = {
            type: "qcm",
            question: "Quelle est la nature de x² + 2x + 1 ?",
            options: ["Une identité remarquable", "Un polynôme du 3ème degré", "Une fonction constante"],
            answer: "Une identité remarquable",
            sender: "teacher"
          };

          // Update board with QCM
          handleMessage(null, qcmData);

          setMessages(prev => [...prev, {
            text: "Voici l'explication : Pour résoudre x² + 2x + 1 = 0, on remarque que c'est une identité remarquable (x + 1)² = 0. Donc la solution est x = -1.",
            sender: "teacher",
            isMath: true
          }]);
        }, 2000);
      }, 1000);

      // Try to extract an equation or update board with user input (visual)
      if (msg.length < 50) {
        setBoardContent(prev => ({
          ...prev,
          equation: msg,
          qcm: null // Clear QCM on new question
        }));
      }

      setTimeout(() => setManualState(null), 3000);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <WelcomeUI
        visible={needsClickToPlay}
        onEnableSound={handleEnableSound}
      />

      <Canvas shadows camera={{ position: [0, 2, 7], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience
          state={currentState}
          boardContent={boardContent}
          onSendMessage={handleMessage}
        />
      </Canvas>

      <Interface messages={messages} onSendMessage={handleMessage} />
    </div>
  );
}

export default App;
