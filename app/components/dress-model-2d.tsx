"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
    imageUrl: string;
    poseResults: any;
    videoRef: React.RefObject<HTMLVideoElement | null>;
};

const CONFIG = {
    widthMultiplier: 3,     // Dress width = shoulder width × this
    yOffset: 0,             // Percentage down from shoulders
};

class KalmanFilter {
    private x = 0;
    private p = 1;
    private initialized = false;

    constructor(private q: number, private r: number) {}

    update(v: number) {
        if (!this.initialized) {
            this.x = v;
            this.initialized = true;
            return v;
        }
        this.p += this.q;
        const k = this.p / (this.p + this.r);
        this.x += k * (v - this.x);
        this.p *= 1 - k;
        return this.x;
    }
}

export default function DressModel2D({ imageUrl, poseResults, videoRef }: Props) {
    const [position, setPosition] = useState({ x: 50, y: 50, width: 200, visible: false });

    const filters = useRef({
        x: new KalmanFilter(0.0001, 0.1),
        y: new KalmanFilter(0.0001, 0.1),
        width: new KalmanFilter(0.0001, 0.15),
    });

    useEffect(() => {
        const landmarks = poseResults?.poseLandmarks;
        if (!landmarks) {
            setPosition(prev => ({ ...prev, visible: false }));
            return;
        }

        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        // Need both shoulders visible
        if (!leftShoulder || !rightShoulder ||
            leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
            setPosition(prev => ({ ...prev, visible: false }));
            return;
        }

        // Shoulder center position (percentage)
        const centerX = ((leftShoulder.x + rightShoulder.x) / 2) * 100;
        const centerY = ((leftShoulder.y + rightShoulder.y) / 2) * 100 + CONFIG.yOffset;

        // Shoulder width in pixels
        const shoulderWidthPercent = Math.abs(rightShoulder.x - leftShoulder.x);
        const shoulderWidthPx = shoulderWidthPercent * window.innerWidth;
        const dressWidth = shoulderWidthPx * CONFIG.widthMultiplier;

        const f = filters.current;
        setPosition({
            x: f.x.update(centerX),
            y: f.y.update(centerY),
            width: f.width.update(dressWidth),
            visible: true,
        });
    }, [poseResults]);

    if (!position.visible) return null;

    return (
        <img
            src={imageUrl}
            alt="Dress overlay"
            style={{
                position: "absolute",
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, 0)",
                width: `${position.width}px`,
                height: "auto",
                pointerEvents: "none",
                zIndex: 3,
            }}
        />
    );
}
