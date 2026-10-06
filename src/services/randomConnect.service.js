import {
  getSocketClient,
  sendSocketMessage,
  subscribeTo,
  unsubscribeFrom,
} from "../socket/socket";

const joinRandomConnect = () => {
  return sendSocketMessage("random-connect:join");
};

const leaveRandomConnect = () => {
  return sendSocketMessage("random-connect:leave");
};

const nextRandomUser = (connectionId) => {
  if (!connectionId) {
    return false;
  }

  return sendSocketMessage("random-connect:next", {
    connectionId,
  });
};

const endRandomConnection = (connectionId) => {
  if (!connectionId) {
    return false;
  }

  return sendSocketMessage("random-connect:end", {
    connectionId,
  });
};

const sendSignal = (connectionId, signal) => {
  if (!connectionId || !signal) {
    return false;
  }

  return sendSocketMessage("random-connect:signal", {
    connectionId,
    signal,
  });
};

const subscribeToRandomConnectEvent = (
  event,
  callback
) => {
  if (!event || !callback) {
    return null;
  }

  return subscribeTo(event, callback);
};

const unsubscribeFromRandomConnectEvent = (
  subscription
) => {
  return unsubscribeFrom(subscription);
};

const getRandomConnectSocket = () => {
  return getSocketClient();
};

export default {
  joinRandomConnect,
  leaveRandomConnect,
  nextRandomUser,
  endRandomConnection,
  sendSignal,
  subscribeToRandomConnectEvent,
  unsubscribeFromRandomConnectEvent,
  getRandomConnectSocket,
};