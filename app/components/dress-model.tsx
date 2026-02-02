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

const CONFIG = {
    scaleMultiplier: 1.25,  // Adjust this (1.2 - 1.3)
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
        scale: new KalmanFilter(0.0001, 0.2),
    });

    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    // Model bounding box
    const modelInfo = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clonedScene);
        return {
            height: box.max.y - box.min.y,
            top: box.max.y,
            centerX: (box.max.x + box.min.x) / 2,
        };
    }, [clonedScene]);

    useFrame(() => {
        if (!groupRef.current) return;
        const landmarks = poseResults?.poseLandmarks;
        const video = videoRef.current;

        if (!landmarks || !video) {
            groupRef.current.visible = false;
            return;
        }

        const nose = landmarks[0];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        if (!nose || nose.visibility < 0.5) {
            groupRef.current.visible = false;
            return;
        }

        groupRef.current.visible = true;

        // Video crop calculation
        const videoAspect = video.videoWidth / video.videoHeight;
        const screenAspect = size.width / size.height;

        let visibleHeightNorm = 1;
        let cropOffsetY = 0;

        if (videoAspect <= screenAspect) {
            visibleHeightNorm = videoAspect / screenAspect;
            cropOffsetY = (1 - visibleHeightNorm) / 2;
        }

        const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
        const cameraZ = camera.position.z;
        const visibleHeight = 2 * Math.tan(fov / 2) * cameraZ;
        const visibleWidth = visibleHeight * (size.width / size.height);

        // Estimate HEAD TOP position (above nose)
        // Face height is roughly nose to ear, head top is similar distance above nose
        let headTopY = nose.y;
        if (leftEar && rightEar && leftEar.visibility > 0.3 && rightEar.visibility > 0.3) {
            const earY = (leftEar.y + rightEar.y) / 2;
            const faceHeight = Math.abs(earY - nose.y);
            headTopY = nose.y - faceHeight * 1.5; // Top of head above nose
        } else {
            headTopY = nose.y - 0.08; // Estimate ~8% of screen above nose
        }

        // Get body X center from shoulders
        let bodyCenterX = nose.x;
        if (leftShoulder && rightShoulder &&
            leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
            bodyCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        }

        // Get ANKLE position (bottom of body)
        let ankleY = 1.0; // Default to bottom of screen
        if (leftAnkle && rightAnkle && leftAnkle.visibility > 0.3 && rightAnkle.visibility > 0.3) {
            ankleY = (leftAnkle.y + rightAnkle.y) / 2;
        } else if (leftHip && rightHip && leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
            // Estimate: ankles are roughly same distance below hips as hips are below head
            const hipY = (leftHip.y + rightHip.y) / 2;
            const upperBody = hipY - headTopY;
            ankleY = hipY + upperBody; // Estimate legs same length as upper body
        }

        // Full body height in normalized coords
        const bodyHeightNorm = ankleY - headTopY;

        // Convert to 3D units
        const bodyHeight3D = (bodyHeightNorm / visibleHeightNorm) * visibleHeight;

        // Scale: model height should match body height
        const targetScale = (bodyHeight3D / modelInfo.height) * CONFIG.scaleMultiplier;

        // Head top position in 3D
        const headTopAdj = (headTopY - cropOffsetY) / visibleHeightNorm;
        const headTop3D = (0.5 - headTopAdj) * visibleHeight;

        // Body center X in 3D
        const centerX3D = (bodyCenterX - 0.5) * visibleWidth;

        const f = filters.current;
        const smoothX = f.x.update(centerX3D);
        const smoothY = f.y.update(headTop3D);
        const smoothScale = f.scale.update(targetScale);

        // Position: model TOP at head TOP
        const yOffset = -modelInfo.top * smoothScale;

        groupRef.current.position.set(smoothX, smoothY + yOffset, 0);
        groupRef.current.scale.setScalar(smoothScale);
    });

    return (
        <group ref={groupRef}>
            <primitive object={clonedScene} />
        </group>
    );
}
