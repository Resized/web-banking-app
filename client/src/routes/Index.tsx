import { Link } from "react-router-dom";
import Button from "../components/Button";
import CardBody from "../components/CardBody";
import CardHeader from "../components/CardHeader";
import Container from "../components/Container";
import SmallText from "../components/SmallText";

export default function Index() {

    return (
        <Container maxWidth="480px">
            <CardHeader text={"Web Banking App"} />
            <CardBody>
                <Link to="dashboard">
                    <Button type={"button"}>
                        Dashboard
                    </Button>
                </Link>
                <hr />
                <Link to="login">
                    <Button type={"button"}>
                        Login
                    </Button>
                </Link>
                <SmallText>Don&apos;t have an account?</SmallText>
                <Link to="register">
                    <Button type={"button"}>
                        Register
                    </Button>
                </Link>
            </CardBody>
        </Container>
    );
}
