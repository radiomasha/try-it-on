"use client";

import { useEffect } from "react";

type CameraProps = {
    videoRef: React.RefObject<HTMLVideoElement | null>;
};

export default function Camera({ videoRef }: CameraProps) {
    useEffect(() => {
        let stream: MediaStream | null = null;

        async function startCamera() {
            if (!navigator.mediaDevices?.getUserMedia) {
                console.error("No camera available");
                return;
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: {ideal :"environment" }},
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error("Camera error:", err);
            }
        }

        startCamera();

        return () => {
            stream?.getTracks().forEach((track) => track.stop());
        };
    }, [videoRef]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
                backgroundColor: "black",
            }}
        />
    );
}