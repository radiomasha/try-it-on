"use client";

import { useEffect } from "react";

type BodyTrackerProps = {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onResultsAction: (results: any) => void;
};

export default function BodyTracker({ videoRef, onResultsAction }: BodyTrackerProps) {
    useEffect(() => {
        let pose: any;
        let animationId: number;

        async function init() {
            if (!videoRef.current) return;

            const { Pose } = await import("@mediapipe/pose");
            pose = new Pose({
                locateFile: (file: string) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 2,          // Highest quality (was 1)
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.7,  // Higher threshold (was 0.5)
                minTrackingConfidence: 0.7,   // Higher threshold (was 0.5)
            });

            pose.onResults(onResultsAction);

            const processFrame = async () => {
                if (!videoRef.current || !pose) return;
                try {
                    await pose.send({ image: videoRef.current });
                } catch (e) {
                    console.error("Pose detection error:", e);
                }
                animationId = requestAnimationFrame(processFrame);
            };

            // Wait for video to be ready
            if (videoRef.current.readyState >= 2) {
                processFrame();
            } else {
                videoRef.current.addEventListener("loadeddata", () => processFrame(), { once: true });
            }
        }

        init();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            if (pose) pose.close();
        };
    }, [videoRef, onResultsAction]);

    return null;
}
