import { useState, useEffect } from "react";

export type Alert = "primary" | "success" | "danger" | "warning" | "info";

export function useAlert(initialMessage: string = "", initialType: Alert = "danger", autoDismiss: boolean = true, autoDismissTime: number = 3000) {
    const [message, setMessage] = useState(initialMessage);
    const [show, setShow] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [alertType, setAlertType] = useState(initialType);

    useEffect(() => {
        if (message) {
            setShow(true);
            setFadeOut(false);
            if (autoDismiss) {
                const timer = setTimeout(() => {
                    dismiss();
                }, autoDismissTime);

                // Clean up the timer if the component unmounts or if the message changes
                return () => {
                    clearTimeout(timer)
                };
            }
        }
    }, [message, autoDismiss, autoDismissTime]);

    const dismiss = () => {
        setFadeOut(true);
        setTimeout(() => {
            setShow(false);
            setMessage("");
        }, 500); // Duration should match the CSS transition time
    };

    const setAlert = (msg: string, type: Alert) => {
        setMessage(msg);
        setAlertType(type);
    };

    return { message, show, fadeOut, alertType, setAlert, dismiss };
}
