import { AxiosError } from "axios";
import { json, redirect } from "react-router-dom";
import api from "../services/api";

export async function dashboardLoader() {

    try {
        const response = await api.get('/balance');
        const { status, message, data } = response.data;
        console.log(`Success ${status}: ${message}`);
        return data;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
                // Unauthorized, redirect to login
                return redirect('/login');
            } else {
                // Handle other HTTP errors
                const errorMessage = error.response?.data ?? 'Unknown error occurred';
                const status = error.response?.status ?? 500;
                const statusText = error.response?.statusText ?? 'Internal Server Error';

                console.error('HTTP Error response:', errorMessage);
                throw json(
                    { message: errorMessage },
                    { status: status, statusText: statusText }
                );
            }
        } else if (error instanceof Error) {
            console.error('Error:', error.message);
            throw json(
                { message: error.message },
                { status: 500, statusText: 'Internal Server Error' }
            );
        } else {
            throw json(
                { message: 'Unknown error occurred' },
                { status: 500, statusText: 'Internal Server Error' }
            );
        }
    }
}