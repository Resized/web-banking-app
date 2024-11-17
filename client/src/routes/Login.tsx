import { AxiosError } from "axios";
import { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import CardBody from "../components/CardBody";
import CardHeader from "../components/CardHeader";
import Container from "../components/Container";
import DismissableAlert from "../components/DismissableAlert";
import Input from "../components/Input";
import SmallText from "../components/SmallText";
import { useAlert } from "../hooks/useAlert";
import api from "../services/api";

export default function Login() {
    const { message, show, fadeOut, alertType, setAlert, dismiss } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const { email, password } = Object.fromEntries(formData.entries());

        try {
            const response = await api.post("/auth/login", { email, password });
            const { accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            setAlert("Logged in successfully.", "success");

            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data.error === 'USER_NOT_ACTIVATED') {
                    setAlert(error.response?.data.message, "warning");
                    setTimeout(() => {
                        navigate(`/register/verify/${encodeURIComponent(email.toString())}`);
                    }, 2000);
                } else {
                    if (error.response?.data.message) {
                        setAlert(error.response.data.message, "danger");
                    } else {
                        setAlert('Unknown error occurred', "danger");
                    }
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
            <CardHeader text={"Login"} />
            <CardBody>
                <form id="loginForm" onSubmit={handleSubmit}>
                    <Input type={"email"} id={"loginEmail"} name={"email"} required={true} label={"Email"} />
                    <Input type={"password"} id={"loginPassword"} name={"password"} required={true} label={"Password"} />
                    {show && (
                        <DismissableAlert
                            message={message}
                            type={alertType}
                            fadeOut={fadeOut}
                            onDismiss={dismiss}
                        />
                    )}
                    <Button type={"submit"}>Login</Button>
                </form>
                <Link to="/reset-password">
                    <Button type="button" variant="link" size="sm">Forgot Password?</Button>
                </Link>
                <hr className="my-4" />
                <SmallText>Don&apos;t have an account?</SmallText>
                <Link to="/register">
                    <Button type={"button"}>Register</Button>
                </Link>
                <Link to="/">
                    <Button type={"button"} outline={true}>Back</Button>
                </Link>
            </CardBody>
        </Container>
    );
}
