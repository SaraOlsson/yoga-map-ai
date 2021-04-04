import React, { useState, useCallback, useMemo, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const WebSocketDemo = (props) => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState('wss://echo.websocket.org');
  const messageHistory = useRef([]);

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  React.useEffect(() => {
    console.log(lastMessage)
  },[lastMessage])

  messageHistory.current = useMemo(() =>
    messageHistory.current.concat(lastMessage),[lastMessage]);

  const handleClickChangeSocketUrl = useCallback(() =>
    setSocketUrl('wss://demos.kaazing.com/echo' + props.path), []);

  const handleClickSendMessage = useCallback(() =>
    sendMessage('Hello'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <button
        onClick={handleClickChangeSocketUrl}
      >
        Click Me to change Socket Url
      </button>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'Hello'
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      {/* <ul>
        {messageHistory.current
          .map((message, idx) => message ? <span key={idx}>{message.data}</span> : null)}
      </ul> */}
    </div>
  );
};

export default WebSocketDemo