import React, { useEffect, useState, useRef } from 'react';

const HoloKeyboard = ({ onKeyPress, cursorPos, isInteracting }) => {
    const [activeKey, setActiveKey] = useState(null);
    const keyboardRef = useRef(null);
    const lastPressTime = useRef(0);
    
    // Dragging Logic
    const [pos, setPos] = useState({ x: window.innerWidth / 2 - 300, y: window.innerHeight - 250 });
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

    const rows = [
        ['1','2','3','4','5','6','7','8','9','0'],
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M','SPACE','DEL','ENTER']
    ];

    useEffect(() => {
        if (!cursorPos || !keyboardRef.current) return;

        // Map normalized cursor (0-1) to viewport coordinates
        const cx = cursorPos.x * window.innerWidth;
        const cy = cursorPos.y * window.innerHeight;

        // Find key under cursor
        const keys = document.querySelectorAll('.holo-key');
        let foundKey = null;

        keys.forEach(key => {
            const rect = key.getBoundingClientRect();
            if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
                foundKey = key.getAttribute('data-key');
            }
        });

        setActiveKey(foundKey);

        // Trigger press if interacting (POINT gesture)
        if (foundKey && isInteracting) {
            const now = Date.now();
            if (now - lastPressTime.current > 500) { // Debounce 500ms
                onKeyPress(foundKey);
                lastPressTime.current = now;
                
                // Visual feedback
                const keyElem = document.querySelector(`[data-key="${foundKey}"]`);
                if(keyElem) {
                    keyElem.classList.add('key-pressed');
                    setTimeout(() => keyElem.classList.remove('key-pressed'), 200);
                }
            }
        }
    }, [cursorPos, isInteracting, onKeyPress]);

    return (
        <div id="holo-keyboard" ref={keyboardRef} style={{ top: pos.y, left: pos.x, bottom: 'auto', transform: 'none' }}>
            <div className="hud-header" onMouseDown={handleMouseDown} style={{ cursor: 'grab', marginBottom: '5px', fontSize: '10px', textAlign: 'center' }}>
                HOLO KEYBOARD
            </div>
            {rows.map((row, rIdx) => (
                <div key={rIdx} className="keyboard-row">
                    {row.map(key => (
                        <div key={key} className={`holo-key ${activeKey === key ? 'key-hover' : ''}`} data-key={key} style={{ flex: key === 'SPACE' ? 4 : (key === 'ENTER' ? 2 : 1) }} onClick={() => onKeyPress(key)}>{key === 'SPACE' ? '___' : key}</div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default HoloKeyboard;