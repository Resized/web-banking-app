import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import CardBody from "../components/CardBody";
import CardHeader from "../components/CardHeader";
import Container from "../components/Container";
import DismissableAlert from "../components/DismissableAlert";
import Input from "../components/Input";
import SmallText from "../components/SmallText";
import { useAlert } from "../hooks/useAlert";
import { FormEvent } from "react";
import { AxiosError } from "axios";
import api from "../services/api";

export default function Register() {
    const { message, show, fadeOut, alertType, setAlert, dismiss } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const formData = new FormData(event.currentTarget);
            const { email, password, confirmPassword } = Object.fromEntries(formData.entries());

            if (password !== confirmPassword) {
                setAlert("Passwords do not match!", "danger");
                return;
            }

            const response = await api.post('/auth/register', { email, password });
            const { message } = response.data;

            setAlert(message, "success");

            setTimeout(() => {
                return navigate(`verify/${encodeURIComponent(email.toString())}`);
            }, 2000);

        } catch (error) {
            if (error instanceof AxiosError && error.response?.data.message) {
                setAlert(error.response.data.message, "danger");
            } else if (error instanceof Error) {
                setAlert(error.message, "danger");
            } else {
                setAlert('Unknown error occurred', "danger");
            }
        }
    };

    return (
        <Container maxWidth="480px">
            <CardHeader text={"Register"} />
            <CardBody>
                <form id="registerForm" onSubmit={handleSubmit}>
                    <Input
                        type={"email"}
                        label={"Email"}
                        id={"registerEmail"}
                        name={"email"}
                        required={true}
                    />
                    <Input
                        type={"password"}
                        label={"Password"}
                        id={"registerPassword"}
                        name={"password"}
                        required={true}
                    />
                    <Input
                        type={"password"}
                        label={"Verify Password"}
                        id={"registerVerifyPassword"}
                        name={"confirmPassword"}
                        required={true}
                    />
                    {show && (
                        <DismissableAlert
                            message={message}
                            type={alertType}
                            fadeOut={fadeOut}
                            onDismiss={dismiss}
                        />
                    )}
                    <Button type={"submit"}>
                        Sign up
                    </Button>
                </form>
                <SmallText>By clicking Sign up, you agree to the terms of use.</SmallText>
                <Link to={"/"}>
                    <Button type={"button"} outline={true}>
                        Cancel
                    </Button>
                </Link>
            </CardBody>
        </Container >
    );
}
