import React from "react";

export default function Button({ children, type, outline = false, variant = 'primary', size = 'lg' }: {
    children: React.ReactNode, type?: "submit" | "reset" | "button" | undefined, outline?: boolean,
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link",
    size?: "sm" | "lg" | ""
}) {
    return (
        <div className="d-grid gap-2 col-6 mx-auto">
            <button className={`btn btn-${size} btn-${outline ? "outline-" : ""}${variant} my-1`} type={type}>
                {children}
            </button>
        </div>
    );
}