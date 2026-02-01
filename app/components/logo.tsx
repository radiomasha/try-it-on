"use client"

export default function Logo()
{
    return(
        <img
            src= "/tjm-logo.jpeg"
            alt = "logo"
            style ={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "100px",
                height: "auto",
                objectFit: "contain",
                zIndex: 5,
            }}
        />
    )
}