"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useCallback} from "react";
//import Camera from "./components/camera";
import DressSelection from "./components/dress-selection";
import DressModel from "./components/dress-model";
import BodyTracker from "./components/body-tracker";
import PhotoCapture from "./components/photo";
import Logo from "./components/logo";

import { Canvas } from "@react-three/fiber";
import {Suspense} from "react";

const models: Record<string, string> = {
    dress4: "/models/dress4.glb",
};

const Camera = dynamic(()=> import("./components/camera"), {ssr:false});
export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [poseResults, setPoseResults] = useState<any>(null);

    const handlePoseResults = useCallback((results: any) => {
        setPoseResults(results);
    }, []);

    const modelUrl = selectedModel ? models[selectedModel] : null;

    return (
        <div
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <Camera videoRef={videoRef} />
            <Logo />

            <DressSelection
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
            />

            <BodyTracker
                videoRef={videoRef}
                onResultsAction={handlePoseResults}
            />

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
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ alpha: true, preserveDrawingBuffer: true }}
            >
                <ambientLight intensity={1} />
                <directionalLight position={[0, 5, 5]} intensity={0.5} />

                <Suspense fallback={null}>
                    {modelUrl && poseResults?.poseLandmarks && (
                        <DressModel
                            modelUrl={modelUrl}
                            poseResults={poseResults}
                            videoRef={videoRef}
                        />
                    )}
                </Suspense>
            </Canvas>

            <PhotoCapture
                videoRef={videoRef}
                isModelActive={!!(modelUrl && poseResults?.poseLandmarks)}
            />
            
            {poseResults?.poseLandmarks?.[0] && (
                <div
                    style={{
                        position: "absolute",
                        width: "15px",
                        height: "15px",
                        borderRadius: "50%",
                        backgroundColor: "lime",
                        border: "2px solid white",
                        left: `${poseResults.poseLandmarks[0].x * 100}%`,
                        top: `${poseResults.poseLandmarks[0].y * 100}%`,
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        zIndex: 10,
                    }}
                />
            )}
        </div>
    );
}
