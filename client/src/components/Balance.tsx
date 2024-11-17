import { useRef } from "react";
import CountUp from "react-countup";
import { useLoaderData } from "react-router-dom";
import CardBody from "./CardBody";
import CardHeader from "./CardHeader";
import Container from "./Container";

export default function Balance({ balance }: { balance: number }) {
    const lastBalance = useRef(0);
    const loaderData = useLoaderData() as { amount: number, email: string };
    const email = loaderData.email;

    function handleCountEnd() {
        lastBalance.current = balance;
    }

    return (
        <Container>
            <CardHeader text={"Balance"} />
            <CardBody>
                <h3>
                    <CountUp onEnd={handleCountEnd} start={lastBalance.current} end={balance} prefix="₪" />
                </h3>
            </CardBody>
            <div className="card-footer text-body-secondary">
                {email}
            </div>
        </Container>
    );
}