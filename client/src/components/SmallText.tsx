import React from "react";

export default function SmallText({ children }: { children: React.ReactNode }) {
    return (
        <div className={"text-body-secondary"}>
            <small>{children}</small>
        </div>
    );
}