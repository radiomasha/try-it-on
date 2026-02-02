"use client";

import { dresses } from "../config/dresses";

type Props = {
    selectedModel: string | null;
    setSelectedModelAction: (model: string | null) => void;
};

export default function DressSelection({ selectedModel, setSelectedModelAction }: Props) {
    return (
        <div
            style={{
                position: "absolute",
                bottom: "45px",
                width: "100%",
                height: "80px",
                display: "flex",
                gap: "15px",
                overflowX: "auto",
                overflowY: "hidden",
                alignItems: "center",
                padding: "0 15px",
                zIndex: 5,
            }}
        >
            {dresses.map((dress, index) => (
                <div
                    key={dress.id}
                    onClick={() => setSelectedModelAction(dress.id)}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                        width: "75px",
                        height: "75px",
                        borderRadius: "50%",
                        border: selectedModel === dress.id ? "3px solid #D42A3B" : "2px solid white",
                        backgroundColor: "white",
                        overflow: "hidden",
                        cursor: "pointer",
                        flex: "0 0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "none",
                        userSelect: "none",
                    }}
                >
                    <img
                        src={dress.thumb}
                        alt={`Dress ${index + 1}`}
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                            width: "auto",
                            height: "100%",
                            pointerEvents: "none",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
