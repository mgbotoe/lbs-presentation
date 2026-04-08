import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSMessageToClient, WSMessageToServer } from '../types';

interface UseWebSocketOptions {
  role: 'presenter' | 'audience';
  onMessage?: (msg: WSMessageToClient) => void;
}

export function useWebSocket({ role, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host =
      import.meta.env.DEV
        ? `${window.location.hostname}:3000`
        : window.location.host;
    const ws = new WebSocket(`${protocol}//${host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'register', role }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessageToClient = JSON.parse(event.data);
        onMessageRef.current?.(msg);
      } catch { /* ignore malformed */ }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [role]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((msg: WSMessageToServer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, send };
}
