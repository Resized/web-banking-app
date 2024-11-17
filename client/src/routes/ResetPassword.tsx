import { FormEvent } from "react";
import CardBody from "../components/CardBody";
import CardHeader from "../components/CardHeader";
import Container from "../components/Container";
import Input from "../components/Input";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../hooks/useAlert";
import { AxiosError } from "axios";
import Button from "../components/Button";
import DismissableAlert from "../components/DismissableAlert";

export default function ResetPassword() {
    const { message, show, fadeOut, alertType, setAlert, dismiss } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const { email } = Object.fromEntries(formData.entries());

        try {
            const response = await api.post("/auth/reset-password", { email });

            setAlert(response.data.message, "success");

            setTimeout(() => {
                navigate(`confirm/${encodeURIComponent(email.toString())}`);
            }, 2000);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data.message) {
                    setAlert(error.response.data.message, "danger");
                } else {
                    setAlert('Unknown error occurred', "danger");
                }
            } else if (error instanceof Error) {
                // Handle other types of errors
                setAlert(error.message, "danger");
            } else {
                // Fallback for unknown errors
                setAlert('Unknown error occurred', "danger");
            }
        }
    };


    return (
        <Container maxWidth="480px">
            <CardHeader text={"Reset Password"} />
            <CardBody>
                <p>Enter your email and we'll send you directions<br />to reset your password</p>
                <form id="resetForm" onSubmit={handleSubmit}>
                    <Input type={"email"} id={"resetEmail"} name={"email"} required={true} label={"Email"} />
                    {show && (
                        <DismissableAlert
                            message={message}
                            type={alertType}
                            fadeOut={fadeOut}
                            onDismiss={dismiss}
                        />
                    )}
                    <Button type="submit">Send code to email</Button>
                </form>
            </CardBody>
        </Container>

    );
}