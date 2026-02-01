"use client";

import {useEffect, useRef, CSSProperties} from "react";

export default function Camera() {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        async function initCamera(){
            if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia)
            try{
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
                if(videoRef.current){
                    videoRef.current.srcObject = stream;
                }
            }
            catch(err){
                console.error("No access to camera", err);
            }
        }
        initCamera();
    }, []);
    
    const videoStyle: CSSProperties = {
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
    };
    
    return (
        <video ref={videoRef}
            autoPlay
            playsInline
            muted
            style= {videoStyle}
      />
    );
}