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
  const { animations: talkAnimation1 } = useGLTF('animations/F_Talking_Variations_001.glb');
  const { animations: talkAnimation2 } = useGLTF('animations/F_Talking_Variations_003.glb');
  const { animations: talkAnimation3 } = useGLTF('animations/F_Talking_Variations_005.glb');
  const { animations: celebrateAnimation } = useGLTF('animations/F_Dances_001.glb');

  // 3. Animation Registry / Setup
  const animations = useMemo(() => {
    // Clone and name the clips
    const idle = idleAnimation[0].clone();
    idle.name = "idle";

    const idleVar = idleVariationAnimation[0].clone();
    idleVar.name = "idle_variation";

    const talk1 = talkAnimation1[0].clone();
    talk1.name = "talk_1";

    const talk2 = talkAnimation2[0].clone();
    talk2.name = "talk_2";

    const talk3 = talkAnimation3[0].clone();
    talk3.name = "talk_3";

    const celebrate = celebrateAnimation[0].clone();
    celebrate.name = "celebrate";

    return [idle, idleVar, talk1, talk2, talk3, celebrate];
  }, [idleAnimation, idleVariationAnimation, talkAnimation1, talkAnimation2, talkAnimation3, celebrateAnimation]);

  const { actions, names } = useAnimations(animations, group);

  // 4. State to Animation mapping
  useEffect(() => {
    console.log("Avatar State:", state);
    let currentAction = "idle";

    if (state === "talk") {
      const talkActions = ["talk_1", "talk_2", "talk_3"];
      currentAction = talkActions[Math.floor(Math.random() * talkActions.length)];
    } else if (state === "celebrate") {
      currentAction = "celebrate";
    }

    if (actions[currentAction]) {
      // Fade out all actions except the base idle and current one
      Object.keys(actions).forEach((key) => {
        if (key !== currentAction && key !== "idle") {
          actions[key].fadeOut(0.3);
        }
      });

      actions[currentAction].reset().fadeIn(0.3).play();

      return () => {
        if (actions[currentAction]) {
          actions[currentAction].fadeOut(0.3);
        }
      };
    }
  }, [state, actions]);

  // 5. Random Idle Variations
  useEffect(() => {
    if (state !== "idle") return;

    let timeout;
    const playVariation = () => {
      timeout = setTimeout(() => {
        if (state === "idle" && actions["idle_variation"]) {
          actions["idle_variation"].reset().fadeIn(0.5).play();
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

  // 6. BLINKING, MOUTH & LOOKAT LOGIC
  const [blink, setBlink] = useState(false);

  useFrame((stateFrame, delta) => {
    // Force Head and Neck to follow camera
    const head = group.current.getObjectByName("Head");
    const neck = group.current.getObjectByName("Neck");

    if (head) {
      // Create a target position that is exactly where the camera is
      const target = new THREE.Vector3().copy(stateFrame.camera.position);

      // LookAt logic for the head
      head.lookAt(target);

      // If we want it to be slightly smoother but still "always" pointing
      // head.quaternion.slerp(targetRotation, 0.2); 
    }

    if (neck) {
      // Neck follows camera but with less intensity for a natural feel
      const target = new THREE.Vector3().copy(stateFrame.camera.position);
      // We use a dummy object to calculate the lookAt rotation for the neck
      // so we can limit the intensity
      const dummy = new THREE.Object3D();
      dummy.position.copy(neck.getWorldPosition(new THREE.Vector3()));
      dummy.lookAt(target);
      neck.quaternion.slerp(dummy.quaternion, 0.1);
    }

    // Procedural Mouth Movement when talking
    // Wolves RPM models use Wolf3D_Head or Wolf3D_Avatar for head morphs
    const headNode = nodes.Wolf3D_Head || nodes.Wolf3D_Avatar;
    if (state === "talk" && headNode && headNode.morphTargetDictionary) {
      const mouthOpenIdx = headNode.morphTargetDictionary["mouthOpen"];
      if (mouthOpenIdx !== undefined) {
        const influence = (Math.sin(stateFrame.clock.elapsedTime * 15) + 1) / 2 * 0.4;
        headNode.morphTargetInfluences[mouthOpenIdx] = influence;

        if (nodes.Wolf3D_Teeth) {
          const teethMouthOpenIdx = nodes.Wolf3D_Teeth.morphTargetDictionary["mouthOpen"];
          if (teethMouthOpenIdx !== undefined) {
            nodes.Wolf3D_Teeth.morphTargetInfluences[teethMouthOpenIdx] = influence;
          }
        }
      }
    } else if (headNode && headNode.morphTargetDictionary) {
      const mouthOpenIdx = headNode.morphTargetDictionary["mouthOpen"];
      if (mouthOpenIdx !== undefined) {
        headNode.morphTargetInfluences[mouthOpenIdx] = THREE.MathUtils.lerp(
          headNode.morphTargetInfluences[mouthOpenIdx],
          0,
          0.1
        );
      }
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
useGLTF.preload('animations/F_Talking_Variations_003.glb');
useGLTF.preload('animations/F_Talking_Variations_005.glb');
useGLTF.preload('animations/F_Dances_001.glb');
