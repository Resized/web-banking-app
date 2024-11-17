import { FormEvent } from "react";
import CardBody from "../components/CardBody";
import CardHeader from "../components/CardHeader";
import Container from "../components/Container";
import Input from "../components/Input";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../hooks/useAlert";
import { AxiosError } from "axios";
import Button from "../components/Button";
import DismissableAlert from "../components/DismissableAlert";

export default function ConfirmPassword() {
    const { message, show, fadeOut, alertType, setAlert, dismiss } = useAlert();
    const navigate = useNavigate();
    const { email } = useParams();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const { password, token } = Object.fromEntries(formData.entries());

        if (!email) {
            setAlert("Email parameter is missing", "danger");
            return;
        }

        try {
            const response = await api.patch("/auth/reset-password/confirm", { email: decodeURIComponent(email), token, password });

            setAlert(response.data.message, "success");

            setTimeout(() => {
                navigate("/login");
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
            <CardHeader text={"Set New Password"} />
            <CardBody>
                <p>Enter the code provided to you and the new password</p>
                <form id="resetForm" onSubmit={handleSubmit}>
                    <Input type={"text"} id={"resetCode"} name={"token"} required={true} label={"Code"} />
                    <Input type={"password"} id={"resetPassword"} name={"password"} required={true} label={"New Password"} />
                    {show && (
                        <DismissableAlert
                            message={message}
                            type={alertType}
                            fadeOut={fadeOut}
                            onDismiss={dismiss}
                        />
                    )}
                    <Button type="submit">Reset Password</Button>
                </form>
            </CardBody>
        </Container>

    );
}