"use client";

import { useRef, useState, useCallback } from "react";
import Camera from "./components/camera";
import DressSelection from "./components/dress-selection";
import DressModel from "./components/dress-model";
import DressModel2D from "./components/dress-model-2d";
import BodyTracker from "./components/body-tracker";
import PhotoCapture from "./components/photo";
import Logo from "./components/logo";
import { Canvas } from "@react-three/fiber";
import { getDressById } from "./config/dresses";

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [poseResults, setPoseResults] = useState<any>(null);

    const handlePoseResults = useCallback((results: any) => {
        setPoseResults(results);
    }, []);

    const dress = selectedModel ? getDressById(selectedModel) : null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            touchAction: "none",
        }}>
            <Camera videoRef={videoRef} />
            <Logo />
            <DressSelection
                selectedModel={selectedModel}
                setSelectedModelAction={setSelectedModel}
            />
            <BodyTracker videoRef={videoRef} onResultsAction={handlePoseResults} />

            {/* 3D Model */}
            {dress?.glb && poseResults?.poseLandmarks && (
                <Canvas
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 2,
                    }}
                    camera={{ position: [0, 0, 1], fov: 50 }}
                    gl={{ alpha: true, preserveDrawingBuffer: true }}
                >
                    <ambientLight intensity={1} />
                    <directionalLight position={[0, 5, 5]} intensity={0.5} />
                    <DressModel modelUrl={dress.glb} poseResults={poseResults} videoRef={videoRef} />
                </Canvas>
            )}

            {/* 2D Overlay */}
            {dress?.overlay && !dress?.glb && poseResults?.poseLandmarks && (
                <DressModel2D imageUrl={dress.overlay} poseResults={poseResults} videoRef={videoRef} />
            )}

            <PhotoCapture videoRef={videoRef} isModelActive={!!(dress && (dress.glb || dress.overlay) && poseResults?.poseLandmarks)} />
        </div>
    );
}
