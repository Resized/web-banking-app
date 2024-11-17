import { useEffect, useRef } from 'react';

const useWebSocket = (
    url: string,
    onMessage: (event: MessageEvent) => void,
    onError: (error: Event) => void
) => {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('Access token is missing');
            return;
        }

        const wsUrl = `${url}?token=${accessToken}`;
        const ws = new WebSocket(wsUrl);

        wsRef.current = ws;

        ws.onmessage = (event) => {
            onMessage(event);
        };

        ws.onerror = (error) => {
            onError(error);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url, onMessage, onError]);

    return wsRef.current;
};

export default useWebSocket;
