import React, { useEffect, useRef } from 'react';

const ChatPanel = ({ messages }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div id="chat-panel">
            <div className="hud-header">COMMUNICATION LOG</div>
            <div id="chat-history">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender === 'USER' ? 'user-msg' : (msg.sender === 'SYS' ? 'sys-msg' : 'ai-msg')}`}>{msg.text}</div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};

export default ChatPanel;