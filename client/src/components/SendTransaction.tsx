import { FormEvent, useState } from "react";
import { useAlert } from "../hooks/useAlert";
import Button from "./Button";
import CardBody from "./CardBody";
import CardHeader from "./CardHeader";
import Container from "./Container";
import DismissableAlert from "./DismissableAlert";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export default function SendTransaction({ onSend }: { onSend: (transactionData: { receiver: string, amount: number }) => Promise<void> }) {
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState('');
    const { message, show, fadeOut, alertType, setAlert, dismiss } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newTransaction = {
            receiver: receiver,
            amount: parseInt(amount)
        };

        try {
            await onSend(newTransaction);
            // Clear the form inputs
            setReceiver('');
            setAmount('');
            setAlert("Transaction successful", "success");
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                if (error.response.status === 401) {
                    return navigate('/login');
                }
                setAlert(error.response.data.message, "danger");
            } else if (error instanceof Error) {
                setAlert(error.message, "danger");
            } else {
                setAlert("Unknown error happened", "danger");
            }
        }

    };

    return (
        <Container>
            <CardHeader text={"Send"} />
            <CardBody>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            id="sendReceiver"
                            type="email"
                            name="receiver"
                            value={receiver}
                            className="form-control rounded-3"
                            placeholder=""
                            onChange={(e) => setReceiver(e.target.value)}
                            required={true}
                        />
                        <label htmlFor="id">Recipient</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            id="sendAmount"
                            type="number"
                            name="amount"
                            value={amount}
                            className="form-control rounded-3"
                            placeholder=""
                            onChange={(e) => setAmount(e.target.value)}
                            required={true}
                        />
                        <label htmlFor="id">Amount</label>
                    </div>
                    {show && (
                        <DismissableAlert
                            message={message}
                            type={alertType}
                            fadeOut={fadeOut}
                            onDismiss={dismiss}
                        />
                    )}
                    <Button type={"submit"}>Submit</Button>
                </form>
            </CardBody>
        </Container >
    );
}