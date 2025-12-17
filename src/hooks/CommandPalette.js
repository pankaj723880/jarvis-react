import React, { useState, useEffect, useRef } from 'react';

const CommandPalette = ({ isOpen, onClose, commands }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const filteredCommands = commands.filter(cmd => 
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div id="command-palette-overlay" onClick={onClose}>
            <div id="command-palette" onClick={e => e.stopPropagation()}>
                <div className="palette-header">COMMAND LINE INTERFACE</div>
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="> Type a command..." 
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                    onKeyDown={handleKeyDown}
                />
                <div className="command-list">
                    {filteredCommands.map((cmd, idx) => (
                        <div 
                            key={cmd.id} 
                            className={`command-item ${idx === selectedIndex ? 'selected' : ''}`}
                            onClick={() => { cmd.action(); onClose(); }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                        >
                            <span className="cmd-label">{cmd.label}</span>
                            <span className="cmd-shortcut">RUN</span>
                        </div>
                    ))}
                    {filteredCommands.length === 0 && <div className="command-empty">NO MATCHING PROTOCOLS</div>}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;