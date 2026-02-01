"use client";

import { useState, useCallback } from "react";

type Props = {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isModelActive: boolean;
};

export default function PhotoCapture({ videoRef, isModelActive }: Props) {
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

    const capturePhoto = useCallback(() => {
        if (!isModelActive) return;

        const video = videoRef.current;
        const threeCanvas = document.querySelector("canvas");
        const logo = document.querySelector('img[alt="logo"]') as HTMLImageElement;

        if (!video || !threeCanvas) return;

        // Use screen dimensions for vertical photo
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = screenWidth;
        tempCanvas.height = screenHeight;
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) return;

        // Calculate how to cover the canvas with video (like object-fit: cover)
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = screenWidth / screenHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (videoRatio > canvasRatio) {
            // Video is wider - crop sides
            drawHeight = screenHeight;
            drawWidth = screenHeight * videoRatio;
            offsetX = (screenWidth - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Video is taller - crop top/bottom
            drawWidth = screenWidth;
            drawHeight = screenWidth / videoRatio;
            offsetX = 0;
            offsetY = (screenHeight - drawHeight) / 2;
        }

        // Draw video frame (covering full canvas)
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Draw Three.js canvas on top (same size as screen)
        ctx.drawImage(threeCanvas, 0, 0, screenWidth, screenHeight);

        // Draw logo if available
        if (logo) {
            const logoWidth = 100;
            const logoHeight = logo.naturalHeight * (logoWidth / logo.naturalWidth);
            ctx.drawImage(logo, screenWidth - logoWidth, 0, logoWidth, logoHeight);
        }

        const dataUrl = tempCanvas.toDataURL("image/png");
        setCapturedPhoto(dataUrl);
    }, [videoRef, isModelActive]);

    const savePhoto = useCallback(() => {
        if (!capturedPhoto) return;

        const link = document.createElement("a");
        link.download = `virtual-tryon-${Date.now()}.png`;
        link.href = capturedPhoto;
        link.click();
    }, [capturedPhoto]);

    const closePreview = useCallback(() => {
        setCapturedPhoto(null);
    }, []);

    return (
        <>
            {/* Capture button */}
            <button
                onClick={capturePhoto}
                disabled={!isModelActive}
                style={{
                    position: "absolute",
                    bottom: "100px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    backgroundColor: isModelActive ? "white" : "rgba(255,255,255,0.4)",
                    border: "4px solid rgba(255,255,255,0.5)",
                    cursor: isModelActive ? "pointer" : "not-allowed",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isModelActive ? 1 : 0.5,
                }}
            >
                <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: isModelActive ? "white" : "rgba(255,255,255,0.6)",
                    border: "2px solid #ccc",
                }} />
            </button>

            {/* Photo preview modal */}
            {capturedPhoto && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.9)",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                }}>
                    <img
                        src={capturedPhoto}
                        alt="Captured"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "70vh",
                            objectFit: "contain",
                            borderRadius: "8px",
                        }}
                    />
                    <div style={{
                        display: "flex",
                        gap: "20px",
                        marginTop: "20px"
                    }}>
                        <button
                            onClick={savePhoto}
                            style={{
                                padding: "12px 30px",
                                fontSize: "16px",
                                backgroundColor: "#D42A3B",
                                color: "white",
                                border: "none",
                                borderRadius: "25px",
                                cursor: "pointer",
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={closePreview}
                            style={{
                                padding: "12px 30px",
                                fontSize: "16px",
                                backgroundColor: "transparent",
                                color: "white",
                                border: "2px solid white",
                                borderRadius: "25px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
