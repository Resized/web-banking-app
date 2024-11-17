import { Alert } from "../hooks/useAlert";

interface DismissableAlertProps {
    message: string;
    type: Alert;
    fadeOut: boolean;
    onDismiss: () => void;
}

export default function DismissableAlert({ message, type, fadeOut, onDismiss }: DismissableAlertProps) {
    return (
        <div className={`wrapper ${fadeOut ? '' : 'is-open'}`}>
            <div className="inner">
                <div className={`alert alert-${type} alert-dismissible ${fadeOut ? 'alert-fade-out' : ''}`} role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={onDismiss}></button>
                </div>
            </div>
        </div>
    );
}
