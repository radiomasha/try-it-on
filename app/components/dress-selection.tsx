"use client";

type Props = {
    selectedModel: string | null;
    setSelectedModel: (model: string | null) => void;
};

const dresses = [
    { img: "/dresses/dress1.png", model: "dress1" },
    { img: "/dresses/dress2.png", model: "dress2" },
    { img: "/dresses/dress3.png", model: "dress3" },
    { img: "/dresses/dress4.png", model: "dress4" },
    { img: "/dresses/dress5.png", model: "dress5" },
    { img: "/dresses/dress6.png", model: "dress6" },
    { img: "/dresses/dress7.png", model: "dress7" },
    { img: "/dresses/dress8.png", model: "dress8" },
];

export default function DressSelection({ selectedModel, setSelectedModel }: Props) {
    return (
        <div
            style={{
                position: "absolute",
                bottom: "10px",
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
                    key={index}
                    onClick={() => setSelectedModel(dress.model)}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                        width: "75px",
                        height: "75px",
                        borderRadius: "50%",
                        border: selectedModel === dress.model ? "3px solid #D42A3B" : "2px solid white",
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
                        src={dress.img}
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
