import { useState, useEffect, useRef } from 'react';

export const useHoloCore = (particleCanvasRef) => {
    const [mode, setMode] = useState('IDLE');
    const [theme, setTheme] = useState({ h: 180, s: 100, l: 50 });
    const [gesture, setGesture] = useState('NONE');
    
    const particles = useRef([]);
    const audioContextRef = useRef(null);
    const lastGestureRef = useRef('NONE');
    const gestureHistory = useRef([]);

    // Physics State
    const state = useRef({
        target: { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, scale: 1, explode: 0 },
        current: { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, scale: 1, explode: 0 },
        breath: 0,
        handVisible: false,
        lastSeen: 0
    });

    // Animation Loop
    useEffect(() => {
        let animationFrameId;
        let lastTime = performance.now();

        const loop = (time) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            const s = state.current;
            const t = s.target;
            const c = s.current;
            const lerp = 0.3; // Even snappier for advanced hologram control

            // Physics Interpolation
            if (s.handVisible || (Date.now() - s.lastSeen < 1000)) {
                c.tx += (t.tx - c.tx) * lerp;
                c.ty += (t.ty - c.ty) * lerp;
                c.rx += (t.rx - c.rx) * lerp;
                c.ry += (t.ry - c.ry) * lerp;
                c.rz += (t.rz - c.rz) * lerp;
                c.tz += (t.tz - c.tz) * lerp;
                c.scale += (t.scale - c.scale) * lerp;
                c.explode += (t.explode - c.explode) * 0.1;
            } else {
                // Idle Drift
                const floatX = Math.sin(Date.now() * 0.001) * 15;
                const floatY = Math.cos(Date.now() * 0.0015) * 15;
                c.tx += (floatX - c.tx) * 0.05;
                c.ty += (floatY - c.ty) * 0.05;
                c.rx += (0 - c.rx) * 0.05;
                c.ry += (0 - c.ry) * 0.05;
                c.rz += (0 - c.rz) * 0.05;
                c.tz += (0 - c.tz) * 0.05;
                c.scale += (1 - c.scale) * 0.05;
                c.explode += (0 - c.explode) * 0.05;
            }

            // Breathing
            s.breath += deltaTime * 0.002;

            // --- Particle System ---
            if (particleCanvasRef && particleCanvasRef.current) {
                const ctx = particleCanvasRef.current.getContext('2d');
                const width = particleCanvasRef.current.width;
                const height = particleCanvasRef.current.height;
                
                ctx.clearRect(0, 0, width, height);

                // Emit particles if gesture is active
                if (s.gesture !== 'NONE' && s.gesture !== 'OPEN') {
                    for(let i=0; i<2; i++) {
                        particles.current.push({
                            x: width / 2 + c.tx,
                            y: height / 2 + c.ty,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5,
                            life: 1.0,
                            color: s.gesture === 'GRAB' ? '#ffaa00' : (s.gesture === 'PINCH' ? '#a020f0' : '#00ffcc')
                        });
                    }
                }

                // Update & Draw Particles
                for (let i = particles.current.length - 1; i >= 0; i--) {
                    const p = particles.current[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 0.02;
                    
                    if (p.life <= 0) {
                        particles.current.splice(i, 1);
                    } else {
                        ctx.globalAlpha = p.life;
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.globalAlpha = 1.0;
            }

            animationFrameId = requestAnimationFrame(loop);
        };
        loop(performance.now());
        return () => cancelAnimationFrame(animationFrameId);
    }, [particleCanvasRef]);

    const playGestureSound = (type) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'GRAB') {
                // Low mechanical thud
                osc.type = 'square';
                osc.frequency.setValueAtTime(120, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'PINCH') {
                // High tech blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            }
        } catch (e) {
            console.error("Audio Error:", e);
        }
    };

    const updateInput = (x, y, scale, hasHand, label, numHands = 1, x2 = 0, y2 = 0) => {
        const s = state.current;
        const t = s.target;

        if (hasHand) {
            s.handVisible = true;
            s.lastSeen = Date.now();
            
            // Map Gesture
            let detectedGesture = 'OPEN';
            if (numHands > 1) detectedGesture = 'TWO_HANDS';
            else if (label === 'closed') detectedGesture = 'GRAB';
            else if (label === 'pinch' || label === 'pinchtip') detectedGesture = 'PINCH';
            else if (label === 'point') detectedGesture = 'POINT';
            
            if (detectedGesture !== lastGestureRef.current) {
                if (detectedGesture === 'GRAB' || detectedGesture === 'PINCH') {
                    playGestureSound(detectedGesture);
                }

                // --- Gesture Combo System ---
                const history = gestureHistory.current;
                history.push(detectedGesture);
                if (history.length > 5) history.shift();
                const seq = history.join(',');

                // Combo 1: Quick Grab (OPEN -> GRAB -> OPEN) triggers Shockwave
                if (seq.includes('OPEN,GRAB,OPEN')) {
                    t.explode = 300;
                    setTimeout(() => { state.current.target.explode = 0; }, 500);
                }
                // Combo 2: Quick Pinch (OPEN -> PINCH -> OPEN) triggers Spin
                if (seq.includes('OPEN,PINCH,OPEN')) t.rz += 360;

                lastGestureRef.current = detectedGesture;
            }

            setGesture(detectedGesture);

            const moveRangeX = window.innerWidth / 1.5;
            const moveRangeY = window.innerHeight / 1.5;
            const rotateRange = 60;

            switch(detectedGesture) {
                case 'TWO_HANDS':
                    // Calculate midpoint for position
                    const midX = (x + x2) / 2;
                    const midY = (y + y2) / 2;
                    t.tx = midX * moveRangeX;
                    t.ty = midY * moveRangeY;
                    
                    // Calculate Angle for Roll (RZ)
                    const dx = x2 - x;
                    const dy = y2 - y;
                    // Calculate angle in degrees
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    t.rz = angle;

                    // Calculate distance for scale (Zoom)
                    const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    t.scale = Math.max(0.5, Math.min(3, dist * 3)); // Map distance to scale
                    t.rx = 0; t.ry = 0; t.explode = 0; 
                    t.tz = 0;
                    break;
                case 'POINT':
                    t.tx = 0; t.ty = 0;
                    t.rx = y * -rotateRange;
                    t.ry = x * rotateRange;
                    t.rz = 0;
                    t.tz = 0;
                    t.scale = 1; t.explode = 0;
                    break;
                case 'GRAB':
                    t.scale = 0.5; t.explode = 0;
                    t.tx = x * moveRangeX * 0.5;
                    t.ty = y * moveRangeY * 0.5;
                    t.rx = 0; t.ry = 0; t.rz = 0; t.tz = 0;
                    break;
                case 'PINCH':
                    t.explode = 150;
                    t.tx = 0; t.ty = 0; t.rx = 0; t.ry = 0; t.rz = 0; t.tz = 0;
                    break;
                default: // OPEN
                    t.tx = x * moveRangeX;
                    t.ty = y * moveRangeY;
                    t.rx = 0; t.ry = 0; t.rz = 0;
                    t.tz = (scale - 1) * 300; // Depth Mode: Map hand scale to Z-axis
                    t.scale = 1; t.explode = 0;
                    break;
            }
        } else {
            if (Date.now() - s.lastSeen > 1000) {
                s.handVisible = false;
                setGesture('NONE');
                lastGestureRef.current = 'NONE';
            }
        }
    };

    const resetHologram = () => {
        state.current.target = { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, scale: 1, explode: 0 };
        state.current.current = { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, scale: 1, explode: 0 };
        setGesture('NONE');
    };

    // Update CSS Variables globally
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--base-h', theme.h);
        root.style.setProperty('--base-s', `${theme.s}%`);
        root.style.setProperty('--base-l', `${theme.l}%`);
    }, [theme]);

    return { 
        state: state.current, // Expose ref for direct access in render loop if needed, or force update
        mode, setMode, theme, setTheme, gesture, updateInput, resetHologram
    };
};