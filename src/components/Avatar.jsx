import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Avatar component that handles logical states: "idle", "talk", "celebrate"
 */
export function Avatar({ state = "idle", ...props }) {
  const group = useRef();

  // 1. Load the model
  const { nodes, materials } = useGLTF('models/663e84d22bf045a79933e198.glb');

  // 2. Load animations (GLB format)
  const { animations: idleAnimation } = useGLTF('animations/F_Standing_Idle_001.glb');
  const { animations: idleVariationAnimation } = useGLTF('animations/F_Standing_Idle_Variations_001.glb');
  const { animations: talkAnimation } = useGLTF('animations/F_Talking_Variations_001.glb');
  const { animations: celebrateAnimation } = useGLTF('animations/F_Dances_001.glb');

  // 3. Animation Registry / Setup
  const animations = useMemo(() => {
    // Clone and name the clips
    const idle = idleAnimation[0].clone();
    idle.name = "idle";

    const idleVar = idleVariationAnimation[0].clone();
    idleVar.name = "idle_variation";

    const talk = talkAnimation[0].clone();
    talk.name = "talk";

    const celebrate = celebrateAnimation[0].clone();
    celebrate.name = "celebrate";

    return [idle, idleVar, talk, celebrate];
  }, [idleAnimation, idleVariationAnimation, talkAnimation, celebrateAnimation]);

  const { actions, names } = useAnimations(animations, group);

  // 4. State to Animation mapping
  useEffect(() => {
    let currentAction = "idle";

    if (state === "talk") {
      currentAction = "talk";
    } else if (state === "celebrate") {
      currentAction = "celebrate";
    } else {
      currentAction = "idle";
    }

    if (actions[currentAction]) {
      // Transition with fade
      actions[currentAction].reset().fadeIn(0.5).play();

      return () => {
        if (actions[currentAction]) {
          actions[currentAction].fadeOut(0.5);
        }
      };
    }
  }, [state, actions]);

  // 5. Random Idle Variations
  useEffect(() => {
    if (state !== "idle") return;

    let timeout;
    const playVariation = () => {
      // Play variation every 5-10 seconds
      timeout = setTimeout(() => {
        if (state === "idle" && actions["idle_variation"]) {
          actions["idle_variation"].reset().fadeIn(0.5).play();
          // After variation ends (approx 3-4s), fade back to main idle
          setTimeout(() => {
            if (state === "idle" && actions["idle_variation"]) {
              actions["idle_variation"].fadeOut(0.5);
            }
          }, 3000);
        }
        playVariation();
      }, THREE.MathUtils.randInt(5000, 10000));
    };

    playVariation();
    return () => clearTimeout(timeout);
  }, [state, actions]);

  // 6. BLINKING & LOOKAT LOGIC
  const [blink, setBlink] = useState(false);

  useFrame((stateFrame) => {
    // Head follow
    if (group.current.getObjectByName("Head")) {
      group.current.getObjectByName("Head").lookAt(stateFrame.camera.position);
    }

    // Automatic Blinking
    let lerpSpeed = 0.3;
    if (nodes.EyeLeft && nodes.EyeRight) {
      const blinkInfluence = blink ? 1 : 0;
      nodes.EyeLeft.morphTargetInfluences[nodes.EyeLeft.morphTargetDictionary["eyeBlinkLeft"]] = THREE.MathUtils.lerp(
        nodes.EyeLeft.morphTargetInfluences[nodes.EyeLeft.morphTargetDictionary["eyeBlinkLeft"]],
        blinkInfluence,
        lerpSpeed
      );
      nodes.EyeRight.morphTargetInfluences[nodes.EyeRight.morphTargetDictionary["eyeBlinkRight"]] = THREE.MathUtils.lerp(
        nodes.EyeRight.morphTargetInfluences[nodes.EyeRight.morphTargetDictionary["eyeBlinkRight"]],
        blinkInfluence,
        lerpSpeed
      );
    }
  });

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 150);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} ref={group} dispose={null}>
      <primitive object={nodes.Hips} />
      {Object.keys(nodes).map((key) => {
        const node = nodes[key];
        if (node.type === "SkinnedMesh") {
          return (
            <skinnedMesh
              key={key}
              name={key}
              geometry={node.geometry}
              material={materials[node.material.name]}
              skeleton={node.skeleton}
              morphTargetDictionary={node.morphTargetDictionary}
              morphTargetInfluences={node.morphTargetInfluences}
              castShadow
              receiveShadow
            />
          );
        }
        return null;
      })}
    </group>
  );
}

// Preload assets
useGLTF.preload('models/663e84d22bf045a79933e198.glb');
useGLTF.preload('animations/F_Standing_Idle_001.glb');
useGLTF.preload('animations/F_Standing_Idle_Variations_001.glb');
useGLTF.preload('animations/F_Talking_Variations_001.glb');
useGLTF.preload('animations/F_Dances_001.glb');
