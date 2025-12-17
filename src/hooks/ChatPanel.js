import React, { useEffect, useRef, useState } from 'react';

const ChatPanel = ({ messages }) => {
    const endRef = useRef(null);
    
    // Dragging Logic
    const [pos, setPos] = useState({ x: window.innerWidth - 370, y: 20 });
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        isDragging.current = true;
        offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
        };
        const handleMouseUp = () => { isDragging.current = false; };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div id="chat-panel" style={{ top: pos.y, left: pos.x, right: 'auto', bottom: 'auto', height: '500px' }}>
            <div className="hud-header" onMouseDown={handleMouseDown} style={{ cursor: 'grab' }}>COMMUNICATION LOG</div>
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