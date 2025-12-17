import React, { useState, useEffect } from 'react';

const ConfigModal = ({ isOpen, onClose, onSave, initialKey, initialModel }) => {
    const [key, setKey] = useState(initialKey || '');
    const [model, setModel] = useState(initialModel || 'google/gemini-2.0-flash-001');

    useEffect(() => {
        setKey(initialKey || '');
        setModel(initialModel || 'google/gemini-2.0-flash-001');
    }, [initialKey, initialModel]);

    if (!isOpen) return null;

    const models = [
        "google/gemini-2.0-flash-001",
        "google/gemini-2.0-flash-lite-preview-02-05:free",
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-2.0-pro-exp-02-05:free"
    ];

    return (
        <>
            <div id="config-overlay" style={{ display: 'block' }}></div>
            <div id="config-modal" style={{ display: 'block' }}>
                <div className="hud-header">SYSTEM CONFIGURATION</div>
                
                <div style={{ fontSize: '11px', marginBottom: '5px', color: '#aaa' }}>NEURAL MODEL SELECTION</div>
                <select 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', marginBottom: '15px', background: '#000', color: '#fff', border: '1px solid #333', padding: '8px' }}
                >
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <div style={{ fontSize: '11px', marginBottom: '5px', color: '#aaa' }}>AUTHENTICATION KEY</div>
                <input 
                    type="password" 
                    id="api-key-input" 
                    placeholder="ENTER OPENROUTER KEY (sk-or-v1...)" 
                    style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px', background: '#000', color: '#fff', border: '1px solid #333', padding: '8px' }}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button id="btn-save-key" style={{ flex: 1 }} onClick={() => onSave(key, model)}>SAVE CONFIG</button>
                    <button id="btn-close-key" style={{ flex: 1, background: 'transparent', borderColor: '#555', color: '#555' }} onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </>
    );
};

export default ConfigModal;