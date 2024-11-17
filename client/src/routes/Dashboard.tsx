import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import Balance from "../components/Balance";
import Col from "../components/Col";
import Row from "../components/Row";
import SendTransaction from "../components/SendTransaction";
import Transactions from "../components/Transactions";
import { TransactionData } from "../interfaces/dashboard.interface";
import api from "../services/api";
import Container from "../components/Container";

export default function Dashboard() {
    const loaderData = useLoaderData() as { amount: number, email: string };
    const [balance, setBalance] = useState<number>(loaderData.amount);
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [data, setData] = useState<TransactionData>({
        currentPage: 1,
        total: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
        transactions: []
    });
    const numPerPage = 10;
    const navigate = useNavigate();
    const { lastJsonMessage } = useWebSocket(
        `ws://localhost:3000/api/transactions/events?token=${localStorage.getItem('accessToken')}`, {
        share: false,
        shouldReconnect: () => true,
        onError(event: Event) {
            console.log("error: ", event);
            navigate('/login');
        },
    },
    )

    const fetchTransactionData = useCallback(async () => {
        const offset = (currentPage - 1) * numPerPage;
        try {
            const response = await api.get(`/transactions?limit=${numPerPage}&offset=${offset}`);
            const { status, message, data } = response.data;
            console.log(`Success ${status}: ${message}`);
            setData(data);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                navigate('/login');
            }
        }
    }, [currentPage, navigate]);

    useEffect(() => {
        const message = lastJsonMessage as { type: string, amount: number, createdAt: Date, sender: string, receiver: string };
        if (message) {
            fetchTransactionData();
            setBalance((balance) => balance + message.amount);
        }
    }, [lastJsonMessage, fetchTransactionData])

    useEffect(() => {
        fetchTransactionData();
    }, [currentPage, total, navigate, fetchTransactionData]);

    const handlePage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleLogout = async () => {
        const response = await api.delete('/auth/logout');
        const { status, message } = response.data;
        console.log(`Success ${status}: ${message}`);
        return navigate('/');
    };

    const onSend = async (transactionData: { receiver: string, amount: number }) => {
        const response = await api.post('/transactions', transactionData);
        const { status, message } = response.data;
        console.log(`Success ${status}: ${message}`);
        setTotal((total) => total + 1);
        setBalance((balance) => balance - transactionData.amount);
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={{
                visible: { opacity: 1, scale: 1 },
                hidden: { opacity: 0, scale: 0 }
            }}
        >
            <Container>
                <nav className="navbar rounded-3 bg-body-tertiary p-3">
                    <div className="container-fluid">
                        <Link to={"/dashboard"} className="navbar-brand fs-3 fw-bold text-primary">Web Banking App</Link>
                        <button className="btn btn-lg btn-outline-primary" onClick={handleLogout}>Logout</button>
                    </div>
                </nav>
            </Container>
            <Row>
                <Col span={4}>
                    <Balance balance={balance} />
                    <SendTransaction onSend={onSend} />
                </Col>
                <Col span={8}>
                    <Transactions data={data} handlePage={handlePage} />
                </Col>
            </Row>
        </motion.div>
    );
}
