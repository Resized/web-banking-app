import { Transaction } from "./transaction.interface";

export interface TransactionData {
    total: number,
    currentPage: number,
    totalPages: number,
    hasPrevious: boolean,
    hasNext: boolean,
    transactions: Transaction[],
}

export interface DashboardData {
    balance: number,
    transactionData: TransactionData,
}