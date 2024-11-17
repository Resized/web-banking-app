import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { TransactionData } from "../interfaces/dashboard.interface";
import CardBody from "./CardBody";
import CardFooter from "./CardFooter";
import CardHeader from "./CardHeader";
import Container from "./Container";

export default function Transactions({ data, handlePage }: {
    data: TransactionData,
    handlePage: (pageNumber: number) => void,
}) {
    const loaderData = useLoaderData() as { amount: number, email: string };
    const email = loaderData.email;
    const [height, setHeight] = useState<number | 'auto'>('auto');
    const [direction, setDirection] = useState<number>(0);
    const tableRef = useRef<HTMLTableElement>(null);
    const populatePageButtons = () => {
        const pages = [];
        for (let index = 1; index <= data.totalPages; index++) {
            pages.push(
                <li key={index} className={`page-item ${index == data.currentPage ? "active" : ""}`}>
                    <a className="page-link" onClick={() => {
                        if (index > data.currentPage) {
                            setDirection(1);
                        } else {
                            setDirection(-1);
                        }
                        return handlePage(index);
                    }}>{index}</a>
                </li>);
        }
        return pages;
    }

    useEffect(() => {
        if (tableRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                // We only have one entry, so we can use entries[0].
                const observedHeight = entries[0].contentRect.height
                setHeight(observedHeight);
            })

            resizeObserver.observe(tableRef.current)

            return () => {
                // Cleanup the observer when the component is unmounted
                resizeObserver.disconnect()
            }
        }
    }, [])

    const container = {
        enter: {
        },
        center: {
            transition: {
                staggerChildren: 0.02,
            }
        },
        exit: {
            transition: {
                staggerChildren: 0.02,
            }
        }
    }

    const item = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? 50 : -50,
                opacity: 0,
                transition: {
                    duration: 0.1
                }
            };
        },
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => {
            return {
                x: direction < 0 ? 50 : -50,
                opacity: 0,
                transition: {
                    duration: 0.1
                }
            };
        }
    }

    return (
        <Container>
            <CardHeader text={"Transactions"} />
            <CardBody>
                <motion.div style={{ height, overflow: 'hidden' }} animate={{ height }} transition={{ duration: 0.5 }}>
                    <div className="table-responsive" style={{ overflowX: 'hidden' }}>
                        <table className="table my-0" ref={tableRef}>
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.tbody key={data.currentPage} className="text-start" custom={direction} variants={container} initial="enter" animate="center" exit="exit">
                                    {data.transactions.map((transaction) =>
                                        <motion.tr
                                            layout
                                            key={transaction.createdAt.toString()}
                                            custom={direction}
                                            variants={item}
                                        >
                                            <td className="text-secondary">{new Date(transaction.createdAt).toLocaleString([], { hourCycle: 'h24' })}</td>
                                            {email === transaction.sender ?
                                                <>
                                                    <td>{transaction.receiver}</td>
                                                    <td className="text-end" style={{ color: "red" }}>₪-{transaction.amount}</td>
                                                </>
                                                :
                                                <>
                                                    <td>{transaction.sender}</td>
                                                    <td className="text-end" style={{ color: "green" }}>₪+{transaction.amount}</td>
                                                </>
                                            }
                                        </motion.tr>
                                    )}
                                </motion.tbody>
                            </AnimatePresence>
                        </table>
                    </div>
                </motion.div>
            </CardBody>

            <CardFooter>
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center m-2">
                        <li className={`page-item ${data.hasPrevious ? "" : "disabled"}`}>
                            <a className="page-link" onClick={() => {
                                setDirection(-1);
                                handlePage(data.currentPage - 1);
                            }}>Previous</a>
                        </li>
                        {populatePageButtons()}
                        <li className={`page-item ${data.hasNext ? "" : "disabled"}`}>
                            <a className="page-link" onClick={() => {
                                setDirection(1);
                                handlePage(data.currentPage + 1);
                            }}>Next</a>
                        </li>
                    </ul>
                </nav>
            </CardFooter>
        </Container >
    );
}