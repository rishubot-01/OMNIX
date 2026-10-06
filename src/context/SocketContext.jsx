import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  connectSocket,
  disconnectSocket,
  isSocketConnected,
} from "../socket/socket";

import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({
  children,
}) => {
  const {
    token,
    isAuthenticated,
    loading,
  } = useAuth();

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    /*
     * Auth restore hone tak socket connection
     * start mat karo.
     */
    if (loading) {
      return;
    }

    /*
     * User authenticated nahi hai.
     *
     * Is situation me existing socket ko
     * disconnect karna correct hai.
     *
     * Logout / invalid authentication ke case
     * me AuthContext bhi is state ko trigger karega.
     */
    if (
      !isAuthenticated ||
      !token
    ) {
      disconnectSocket();
      setConnected(false);

      return;
    }

    /*
     * Authenticated user ke liye Socket.IO
     * connection establish / reuse karo.
     */
    const socket = connectSocket({
      token,

      onConnect: () => {
        console.log(
          "SocketProvider: socket connected"
        );

        setConnected(true);
      },

      onError: (error) => {
        console.error(
          "SocketProvider: socket connection error:",
          error
        );

        setConnected(false);
      },

      onDisconnect: (reason) => {
        console.log(
          "SocketProvider: socket disconnected:",
          reason
        );

        setConnected(false);
      },
    });

    /*
     * Agar socket already connected hai,
     * to state immediately synchronize karo.
     */
    if (socket?.connected) {
      setConnected(
        isSocketConnected()
      );
    }

    /*
     * IMPORTANT:
     *
     * Yahan disconnectSocket() mat karo.
     *
     * SocketProvider ka effect cleanup hone par
     * actual Socket.IO connection destroy nahi
     * karna hai.
     *
     * React StrictMode / dependency changes /
     * provider lifecycle ke wajah se cleanup
     * ho sakta hai. Socket ko unnecessarily
     * disconnect karne se:
     *
     * connect
     * disconnect
     * reconnect
     *
     * cycle create ho sakti hai.
     */
    return () => {
      setConnected(false);
    };
  }, [
    token,
    isAuthenticated,
    loading,
  ]);

  /*
   * Socket state ko context consumers ke liye
   * expose karo.
   */
  const value = useMemo(
    () => ({
      connected,

      isConnected:
        connected &&
        isSocketConnected(),
    }),
    [connected]
  );

  return (
    <SocketContext.Provider
      value={value}
    >
      {children}
    </SocketContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| Custom Socket Hook
|--------------------------------------------------------------------------
*/

export const useSocket = () => {
  const context =
    useContext(SocketContext);

  if (!context) {
    throw new Error(
      "useSocket must be used inside SocketProvider"
    );
  }

  return context;
};

export default SocketContext;