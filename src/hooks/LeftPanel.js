import React, { useState, useRef, useEffect } from 'react';

const LeftPanel = ({ onConfigClick, onTrackClick, onScanClick, onCamToggle, onMatrixToggle, onVoiceToggle, onSecurityToggle, onVisualizerToggle, onKeyboardToggle, onScanModeToggle, onNightModeToggle, onMapToggle, onGlobeToggle, onWeatherToggle, onClockToggle, onDashboardToggle, onFocusModeToggle, onSaveLog, onDiagnostics, onReboot, isVisualizerEnabled, isKeyboardOpen, isScanMode, isNightMode, isMapMode, isGlobeMode, isWeatherMode, isClockMode, isDashboardOpen, isFocusMode, status, gesture, fps, isTracking, isCamVisible, isMatrixEnabled, isVoiceEnabled, isSecurityMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (callback) => {
        if (callback) callback();
    };

    // Swipe Gesture
    const panelRef = useRef(null);
    const [touchStart, setTouchStart] = useState(null);

    useEffect(() => {
        const handleTouchStart = (e) => {
            setTouchStart(e.touches[0].clientX);
        };

        const handleTouchMove = (e) => {
            if (touchStart !== null && touchStart - e.touches[0].clientX > 50) {
                setIsOpen(false);
            }
        };

        const handleTouchEnd = () => {
            setTouchStart(null);
        };

        const panel = panelRef.current;
        panel?.addEventListener('touchstart', handleTouchStart);
        panel?.addEventListener('touchmove', handleTouchMove);
        panel?.addEventListener('touchend', handleTouchEnd);
        return () => { panel?.removeEventListener('touchstart', handleTouchStart); panel?.removeEventListener('touchmove', handleTouchMove); panel?.removeEventListener('touchend', handleTouchEnd); };
    }, [touchStart]);

    return (
        <>
            <button 
                id="btn-hamburger" 
                onClick={() => setIsOpen(!isOpen)}
                className={isOpen ? 'active' : ''}
            >
                {isOpen ? '✕' : '☰'}
            </button >
            <div id="left-panel" className={isOpen ? 'sidebar-open' : ''}>
            <div className="hud-header">SYSTEM CONTROLS</div>
            <button id="btn-config" onClick={() => handleAction(onConfigClick)}>⚠ SYSTEM CONFIG</button>
            <button id="btn-track" onClick={() => handleAction(onTrackClick)} className={isTracking ? 'active' : ''}>{isTracking ? 'TERMINATE TRACKING' : 'INIT HAND TRACKING'}</button>
            <button id="btn-cam-toggle" onClick={() => handleAction(onCamToggle)} className={isCamVisible ? 'active' : ''}>{isCamVisible ? 'CAMERA: VISIBLE' : 'CAMERA: HIDDEN'}</button>
            <button id="btn-scan" onClick={() => handleAction(onScanClick)}>✨ VISION SCAN (CAM)</button>
            <button id="btn-voice" onClick={() => handleAction(onVoiceToggle)} className={isVoiceEnabled ? 'active' : ''}>{isVoiceEnabled ? 'TTS AUDIO: ON' : 'TTS AUDIO: OFF'}</button>
            <button id="btn-security" onClick={() => handleAction(onSecurityToggle)} className={isSecurityMode ? 'active' : ''}>{isSecurityMode ? 'SECURITY: ARMED' : 'SECURITY: OFF'}</button>
            <button id="btn-matrix" onClick={() => handleAction(onMatrixToggle)}>{isMatrixEnabled ? 'MATRIX: ON' : 'MATRIX: OFF'}</button>
            <button id="btn-visualizer" onClick={() => handleAction(onVisualizerToggle)} className={isVisualizerEnabled ? 'active' : ''}>{isVisualizerEnabled ? 'VISUALIZER: ON' : 'VISUALIZER: OFF'}</button>
            <button id="btn-keyboard" onClick={() => handleAction(onKeyboardToggle)} className={isKeyboardOpen ? 'active' : ''}>{isKeyboardOpen ? 'KEYBOARD: ON' : 'KEYBOARD: OFF'}</button>
            <button id="btn-ar-scan" onClick={() => handleAction(onScanModeToggle)} className={isScanMode ? 'active' : ''}>{isScanMode ? 'AR SCANNER: ON' : 'AR SCANNER: OFF'}</button>
            <button id="btn-night-mode" onClick={() => handleAction(onNightModeToggle)} className={isNightMode ? 'active' : ''}>{isNightMode ? 'NIGHT MODE: ON' : 'NIGHT MODE: OFF'}</button>
            <button id="btn-map" onClick={() => handleAction(onMapToggle)} className={isMapMode ? 'active' : ''}>{isMapMode ? 'HOLO-MAP: ON' : 'HOLO-MAP: OFF'}</button>
            <button id="btn-globe" onClick={() => handleAction(onGlobeToggle)} className={isGlobeMode ? 'active' : ''}>{isGlobeMode ? 'HOLO-GLOBE: ON' : 'HOLO-GLOBE: OFF'}</button>
            <button id="btn-weather" onClick={() => handleAction(onWeatherToggle)} className={isWeatherMode ? 'active' : ''}>{isWeatherMode ? 'WEATHER: ON' : 'WEATHER: OFF'}</button>
            <button id="btn-clock" onClick={() => handleAction(onClockToggle)} className={isClockMode ? 'active' : ''}>{isClockMode ? 'HOLO-CLOCK: ON' : 'HOLO-CLOCK: OFF'}</button>
            <button id="btn-dashboard" onClick={() => handleAction(onDashboardToggle)} className={isDashboardOpen ? 'active' : ''}>{isDashboardOpen ? 'SYS STATUS: ON' : 'SYS STATUS: OFF'}</button>
            <button id="btn-focus" onClick={() => handleAction(onFocusModeToggle)} className={isFocusMode ? 'active' : ''}>{isFocusMode ? 'FOCUS MODE: ON' : 'FOCUS MODE: OFF'}</button>
            <button id="btn-save" onClick={() => handleAction(onSaveLog)}>💾 SAVE LOG</button>
            <button id="btn-diag" onClick={() => handleAction(onDiagnostics)}>🩺 DIAGNOSTICS</button>
            <button id="btn-reboot" onClick={() => handleAction(onReboot)}>🔄 SYSTEM REBOOT</button>
            
            <select id="gesture-list" className="hud-select" defaultValue="">
                <option value="" disabled>▼ VIEW GESTURE COMMANDS ▼</option>
                <option disabled>--- HAND STATES ---</option>
                <option>🖐 OPEN HAND: Move Position (2D)</option>
                <option>☝ POINT: Rotate View (3D)</option>
                <option>✊ FIST: Shrink (Orange)</option>
                <option>👌 PINCH: Explode View (Purple)</option>
            </select>

            <div style={{ fontSize: '10px', marginTop: 'auto', color: '#777', paddingTop: '20px' }}>
                CORE STATUS: <span id="status-text" style={{ color: 'var(--holo-color)' }}>{status}</span><br/>
                GESTURE: <span id="gesture-text" style={{ color: '#fff' }}>{gesture}</span><br/>
                FPS: <span id="fps-counter">{fps}</span>
            </div>
            </div >
            {isOpen && <div id="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
};

export default LeftPanel;