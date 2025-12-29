import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Interface } from "./components/Interface";
import { WelcomeUI } from "./components/WelcomeUI";
import { useWelcomeManager } from "./hooks/useWelcomeManager";
import { useState, useEffect, useRef } from "react";
import { processProblem, fileToBase64 } from "./services/api";
import { speakText } from "./services/tts";

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
    description: "Identités Remarquables",
    qcm: null
  });

  const [messages, setMessages] = useState([
    {
      text: "Bonjour ! Je suis votre professeur de mathématiques. Comment puis-je vous aider aujourd'hui ? Vous pouvez m'envoyer une photo de votre exercice ou une question.",
      sender: "teacher",
    },
  ]);

  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentExercises, setCurrentExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isAnsweringExercise, setIsAnsweringExercise] = useState(false);

  const hasPlayedWelcome = useRef(false);

  // Play welcome message on mount
  useEffect(() => {
    if (!hasPlayedWelcome.current) {
      hasPlayedWelcome.current = true;
      setTimeout(() => {
        const welcomeMessage = "Bonjour ! Je suis votre professeur de mathématiques. Comment puis-je vous aider aujourd'hui ? Vous pouvez m'envoyer une photo de votre exercice ou une question.";
        speakText(welcomeMessage, {
          onStart: () => setManualState("talk"),
          onEnd: () => setManualState(null)
        });
      }, 500);
    }
  }, []);

  // Effective state logic:
  // 1. If welcome audio is playing -> use welcomeState
  // 2. Else if manualState is set (e.g. "talk" from TTS or "celebrate" from feedback) -> use it
  // 3. Else if isLoading -> use "thinking" (or "idle" for now)
  // 4. Default -> "idle"
  const currentState = isAudioPlaying
    ? welcomeState
    : (manualState || (isLoading ? "idle" : "idle"));

  const handleMessage = async (msg, data) => {
    // 1. Handle QCM Answer from Board
    if (data?.type === "qcm_answer") {
      const ans = msg;
      setMessages(prev => [...prev, { text: `Ma réponse : ${ans}`, sender: "user" }]);

      const isCorrect = boardContent.qcm?.type === "equation_quiz"
        ? ans === boardContent.qcm?.correctAnswer
        : ans === boardContent.qcm?.answer;

      setManualState(isCorrect ? "celebrate" : "idle");

      setTimeout(() => {
        const feedbackText = isCorrect
          ? "Bravo ! C'est exactement ça. Tu as bien compris !"
          : `Pas tout à fait. La bonne réponse est : ${boardContent.qcm?.answer || boardContent.qcm?.correctAnswer}`;

        setMessages(prev => [...prev, {
          text: feedbackText,
          sender: "teacher"
        }]);

        speakText(feedbackText, {
          onStart: () => setManualState("talk"),
          onEnd: () => {
            setManualState(null);

            // If we are in an exercise sequence, offer the next one
            if (isAnsweringExercise && currentExercises.length > 0) {
              const nextIndex = currentExerciseIndex + 1;
              if (nextIndex < currentExercises.length) {
                setTimeout(() => {
                  setMessages(prev => [...prev, {
                    text: "Voulez-vous passer à la question suivante ?",
                    sender: "teacher",
                    showNextQuestionButtons: true,
                    exercisesData: currentExercises,
                    nextIndex: nextIndex
                  }]);
                }, 1000);
              } else {
                // End of series
                setIsAnsweringExercise(false);
                setBoardContent(prev => ({ ...prev, qcm: null }));
                setTimeout(() => {
                  const endText = "Excellent ! Vous avez terminé toute la série d'exercices. Avez-vous d'autres questions ?";
                  setMessages(prev => [...prev, { text: endText, sender: "teacher" }]);
                  speakText(endText, {
                    onStart: () => setManualState("talk"),
                    onEnd: () => setManualState(null)
                  });
                }, 1000);
              }
            }
          }
        });
      }, 1000);
      return;
    }

    if (msg === "NEXT_STEP") {
      setBoardContent(prev => ({ ...prev, qcm: null }));
      return;
    }

    // Handle direct start of exercises from button
    if (data?.type === "start_exercises" && data.exercises) {
      setMessages(prev => [...prev, { text: msg, sender: "user" }]);
      setCurrentExercises(data.exercises);
      setCurrentExerciseIndex(0);
      setIsAnsweringExercise(true);

      const exercise = data.exercises[0];

      // Update board with QCM
      setBoardContent(prev => ({
        ...prev,
        title: `Question 1 (${exercise.difficulty})`,
        equation: exercise.problem,
        description: "Choisissez la bonne réponse",
        qcm: {
          type: "qcm",
          question: exercise.problem,
          options: exercise.options,
          answer: exercise.answer
        }
      }));

      const text = `C'est parti ! Voici votre premier exercice (${exercise.difficulty}). Regardez le tableau !`;
      setMessages(prev => [...prev, { text, sender: "teacher" }]);
      speakText(text, {
        onStart: () => setManualState("talk"),
        onEnd: () => setManualState(null)
      });
      return;
    }

    // Handle next question request
    if (data?.type === "next_question" && data.exercises && data.nextIndex !== undefined) {
      if (msg === "yes") {
        const nextIndex = data.nextIndex;
        const nextExercise = data.exercises[nextIndex];
        setCurrentExerciseIndex(nextIndex);

        // Update board with next QCM
        setBoardContent(prev => ({
          ...prev,
          title: `Question ${nextIndex + 1} (${nextExercise.difficulty})`,
          equation: nextExercise.problem,
          description: "Au suivant !",
          qcm: {
            type: "qcm",
            question: nextExercise.problem,
            options: nextExercise.options,
            answer: nextExercise.answer
          }
        }));

        const text = `Voici la question suivante, niveau ${nextExercise.difficulty}.`;
        setMessages(prev => [...prev, { text, sender: "teacher" }]);
        speakText(text, {
          onStart: () => setManualState("talk"),
          onEnd: () => setManualState(null)
        });
      } else {
        setMessages(prev => [...prev, {
          text: "D'accord ! N'hésitez pas si vous avez d'autres questions.",
          sender: "teacher"
        }]);
        setIsAnsweringExercise(false);
        setBoardContent(prev => ({ ...prev, qcm: null }));
        setCurrentExercises([]);
      }
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

    // 3. Handle Image Upload
    if (data?.type === "image" && data.file) {
      // Create image preview URL
      const imageUrl = URL.createObjectURL(data.file);
      setMessages(prev => [...prev, {
        text: "",
        sender: "user",
        image: imageUrl
      }]);
      setManualState("talk");
      setIsLoading(true);

      try {
        const imageData = await fileToBase64(data.file);
        const response = await processProblem({
          input: "",
          isImage: true,
          history: chatHistory,
          imageData
        });

        // Update chat history
        setChatHistory(prev => [
          ...prev,
          { role: "user", content: response.latex || "Image problem" },
          { role: "assistant", content: response.explanation }
        ]);

        // Display LaTeX on board
        if (response.latex) {
          setBoardContent(prev => ({
            ...prev,
            equation: response.latex,
            description: "Problème extrait",
            qcm: null
          }));
        }

        // Add solution steps as messages
        setMessages(prev => [
          ...prev,
          ...(response.latex ? [{ text: `$$${response.latex.replace(/^\$\$?|\$\$?$/g, '')}$$`, sender: "teacher", isMath: true }] : []),
          ...response.solution.map(step => ({ text: step, sender: "teacher" })),
          { text: response.explanation, sender: "teacher" }
        ]);

        // Speak the explanation
        speakText(response.explanation, {
          onStart: () => setManualState("talk"),
          onEnd: () => setManualState(null)
        });

        // Don't auto-generate QCM - wait for user to request it
        if (response.exercises && response.exercises.length > 0) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "Avez-vous compris l'explication ?",
              sender: "teacher",
              showPracticeButtons: true,
              exercisesData: response.exercises
            }]);
          }, 1500);
        }

      } catch (error) {
        console.error("Error processing image:", error);
        setMessages(prev => [...prev, {
          text: "Désolé, je n'ai pas pu traiter l'image. Veuillez réessayer.",
          sender: "teacher"
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 4. Handle Normal User Message (Text)
    if (typeof msg === "string") {
      setMessages(prev => [...prev, { text: msg, sender: "user" }]);
      setIsLoading(true);

      try {
        // Check if user is answering an exercise
        if (isAnsweringExercise && currentExercises.length > 0) {
          const currentExercise = currentExercises[currentExerciseIndex];

          // Send answer to AI for evaluation
          const evaluationPrompt = `L'élève a répondu "${msg}" à la question: "${currentExercise.problem}". Évalue sa réponse et explique si elle est correcte ou non. Sois pédagogique.`;

          const response = await processProblem({
            input: evaluationPrompt,
            isImage: false,
            history: chatHistory
          });

          // Update chat history
          setChatHistory(prev => [
            ...prev,
            { role: "user", content: msg },
            { role: "assistant", content: response.explanation }
          ]);

          // Show evaluation
          setMessages(prev => [
            ...prev,
            { text: response.explanation, sender: "teacher" }
          ]);


          speakText(response.explanation, {
            onStart: () => setManualState("talk"),
            onEnd: () => setManualState(null)
          });

          // Offer next question or finish
          const nextIndex = currentExerciseIndex + 1;
          if (nextIndex < currentExercises.length) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                text: "Voulez-vous essayer la question suivante ?",
                sender: "teacher",
                showNextQuestionButtons: true,
                exercisesData: currentExercises,
                nextIndex: nextIndex
              }]);
            }, 2000);
          } else {
            setIsAnsweringExercise(false);
            setTimeout(() => {
              setMessages(prev => [...prev, {
                text: "Bravo ! Vous avez terminé tous les exercices. Avez-vous d'autres questions ?",
                sender: "teacher"
              }]);
              speakText("Bravo ! Vous avez terminé tous les exercices.", {
                onStart: () => setManualState("talk"),
                onEnd: () => setManualState(null)
              });
            }, 2000);
          }

          setIsLoading(false);
          return;
        }

        // Normal question (not answering exercise)
        const response = await processProblem({
          input: msg,
          isImage: false,
          history: chatHistory
        });

        // Update chat history
        setChatHistory(prev => [
          ...prev,
          { role: "user", content: msg },
          { role: "assistant", content: response.explanation }
        ]);

        // Check if this is a simple response (no math)
        const isSimpleResponse = !response.latex && response.solution.length === 0 && response.exercises.length === 0;

        if (isSimpleResponse) {
          // Simple greeting/conversation - just show the explanation
          setMessages(prev => [
            ...prev,
            { text: response.explanation, sender: "teacher" }
          ]);


          // Speak the response
          speakText(response.explanation, {
            onStart: () => setManualState("talk"),
            onEnd: () => setManualState(null)
          });
        } else {
          // Math problem - full display
          // Display LaTeX on board
          if (response.latex) {
            setBoardContent(prev => ({
              ...prev,
              equation: response.latex,
              description: "Solution",
              qcm: null
            }));
          }

          // Add solution steps as messages
          setMessages(prev => [
            ...prev,
            ...(response.latex ? [{ text: `$$${response.latex.replace(/^\$\$?|\$\$?$/g, '')}$$`, sender: "teacher", isMath: true }] : []),
            ...response.solution.map(step => ({ text: step, sender: "teacher" })),
            { text: response.explanation, sender: "teacher" }
          ]);


          // Speak the explanation
          speakText(response.explanation, {
            onStart: () => setManualState("talk"),
            onEnd: () => setManualState(null)
          });

          // Offer to practice with an equation
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "Voulez-vous vous entraîner avec quelques exercices ?",
              sender: "teacher",
              showPracticeButtons: true,
              exercisesData: response.exercises
            }]);
          }, 2000);
        }

      } catch (error) {
        console.error("Error processing message:", error);
        setMessages(prev => [...prev, {
          text: "Désolé, j'ai rencontré une erreur. Assurez-vous que le backend est en cours d'exécution et que votre clé API est configurée.",
          sender: "teacher"
        }]);
      } finally {
        setIsLoading(false);
      }
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
