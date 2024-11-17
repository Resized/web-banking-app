import { AxiosError } from "axios";
import { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import CardBody from "../components/CardBody";
import CardHeader from "../components/CardHeader";
import Container from "../components/Container";
import DismissableAlert from "../components/DismissableAlert";
import Input from "../components/Input";
import { useAlert } from "../hooks/useAlert";
import api from "../services/api";

export default function Verify() {
    const { message, show, fadeOut, alertType, setAlert, dismiss } = useAlert();
    const navigate = useNavigate();
    const { email } = useParams();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const formData = new FormData(event.currentTarget);
            const { confirmationCode } = Object.fromEntries(formData.entries());

            if (!email) {
                setAlert("Email parameter is missing", "danger");
                return;
            }

            const response = await api.post('/auth/verify-email', { email: decodeURIComponent(email), confirmationCode });
            const { message } = response.data;

            setAlert(message, "success");

            setTimeout(() => {
                navigate("/login");
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
            <CardHeader text={"Email Verification"} />
            <CardBody>
                <form id="verifyForm" onSubmit={handleSubmit}>
                    <Input type={"text"} id={"verifyEmail"} name={"confirmationCode"} required={true} label={"Confirmation Code"} />
                    {show && (
                        <DismissableAlert
                            message={message}
                            type={alertType}
                            fadeOut={fadeOut}
                            onDismiss={dismiss}
                        />
                    )}
                    <Button type={"submit"}>
                        Submit
                    </Button>
                </form>
                <Link to="/">
                    <Button type={"button"} outline={true}>
                        Cancel
                    </Button>
                </Link>
            </CardBody>
        </Container>
    );
}
