export type DressConfig = {
    id: string;
    thumb: string;        // Button image
    glb?: string;         // 3D model (optional)
    overlay?: string;     // 2D PNG overlay (optional)
};

export const dresses: DressConfig[] = [
    { id: "dress1", thumb: "/dresses/dress1.png" },
    { id: "dress2", thumb: "/dresses/dress2.png"},
    { id: "dress3", thumb: "/dresses/dress3.png" },
    { id: "dress4", thumb: "/dresses/dress4.png", glb: "/models/dress4.glb" },
    { id: "dress5", thumb: "/dresses/dress5.png"},
    { id: "dress6", thumb: "/dresses/dress6.png", overlay: "/overlays/dress6.png" },
    { id: "dress7", thumb: "/dresses/dress7.png" },
    { id: "dress8", thumb: "/dresses/dress8.png" },
];

export function getDressById(id: string): DressConfig | undefined {
    return dresses.find(d => d.id === id);
}