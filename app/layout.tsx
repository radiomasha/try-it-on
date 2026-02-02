import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Virtual Try-On",
    description: "Try on dresses virtually",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body style={{ background: "#000", margin: 0, padding: 0 }}>
        {children}
        </body>
        </html>
    );
}
