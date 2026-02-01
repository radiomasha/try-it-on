"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type Props = {
    modelUrl: string;
    poseResults: any;
    videoRef: React.RefObject<HTMLVideoElement | null>;
};

const MODEL_CONFIG = {
    baseScale: 1.0,      // подбираешь один раз под это платье
    xOffset: 0,
    yOffset: 0,
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

export default function DressModel({ modelUrl, poseResults, videoRef }: Props) {
    const { scene } = useGLTF(modelUrl);
    const groupRef = useRef<THREE.Group>(null);
    const { camera, size } = useThree();

    const filters = useRef({
        x: new KalmanFilter(0.0001, 0.15),
        y: new KalmanFilter(0.0001, 0.15),
    });

    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    const distanceFromOriginToBottom = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clonedScene);
        return box.min.y * -1; // origin = отверстие лица, сдвиг вниз до низа платья
    }, [clonedScene]);

    useFrame(() => {
        if (!groupRef.current) return;
        const landmarks = poseResults?.poseLandmarks;
        const video = videoRef.current;
        if (!landmarks || !video) return;

        const nose = landmarks[0];
        if (!nose || nose.visibility < 0.5) return;

        // Видео crop
        const videoAspect = video.videoWidth / video.videoHeight;
        const screenAspect = size.width / size.height;

        let visibleHeightNorm = 1;
        let cropOffsetY = 0;
        if (videoAspect <= screenAspect) {
            visibleHeightNorm = videoAspect / screenAspect;
            cropOffsetY = (1 - visibleHeightNorm) / 2;
        }

        const fov = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
        const cameraZ = camera.position.z;
        const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
        const visibleWidth = visibleHeight * (size.width / size.height);

        const nx = nose.x;
        const ny = (nose.y - cropOffsetY) / visibleHeightNorm;

        const targetX = (nx - 0.5) * visibleWidth + MODEL_CONFIG.xOffset;
        const targetY = (0.5 - ny) * visibleHeight + MODEL_CONFIG.yOffset;

        const f = filters.current;
        const smoothX = f.x.update(targetX);
        const smoothY = f.y.update(targetY);

        groupRef.current.position.set(smoothX, smoothY, 0);
        groupRef.current.scale.setScalar(MODEL_CONFIG.baseScale);
    });

    return (
        <group ref={groupRef}>
            <primitive object={clonedScene} position={[0, -distanceFromOriginToBottom, 0]} />
        </group>
    );
}