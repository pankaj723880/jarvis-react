import React from 'react';

const InputArea = ({ onSend, onUpload, onMic, loading, inputValue, onInputChange, isListening }) => {
    const handleSend = () => {
        if (inputValue.trim()) {
            onSend(inputValue);
            onInputChange('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div id="input-area">
            <button id="btn-upload" className="icon-btn" title="Upload Image" onClick={onUpload}>📁</button>
            <input 
                type="text" 
                id="user-input" 
                placeholder={loading ? "Processing..." : "Type or use voice..."}
                autoComplete="off"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
            />
            <button id="btn-mic" className={`icon-btn ${isListening ? 'mic-active' : ''}`} title="Voice Command" onClick={onMic}>🎤</button>
            <button id="btn-send" onClick={handleSend} disabled={loading}>SEND</button>
        </div>
    );
};

export default InputArea;