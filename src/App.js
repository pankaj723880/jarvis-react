import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useGemini } from './hooks/useGemini';
import { useHoloCore } from './hooks/useHoloCore';
import Hologram from './hooks/Hologram';
import LeftPanel from './hooks/LeftPanel';
import ChatPanel from './hooks/ChatPanel';
import InputArea from './hooks/InputArea';
import ConfigModal from './hooks/ConfigModal';
import HoloKeyboard from './hooks/HoloKeyboard';
import SystemDashboard from './hooks/SystemDashboard';
import CommandPalette from './hooks/CommandPalette';
import NewsTicker from './hooks/NewsTicker';

function App() {
  const particleCanvasRef = useRef(null);
  const { state, mode, setMode, setTheme, gesture, updateInput, resetHologram } = useHoloCore(particleCanvasRef);
  const { sendRequest, executeCommands, systemInstruction, loading } = useGemini();
  
  const [messages, setMessages] = useState([
    { sender: 'AI', text: 'J.A.R.V.I.S. Core V5.0 Online. Voice & File Systems Active.' }
  ]);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_OPENROUTER_API_KEY || '');
  const [currentModel, setCurrentModel] = useState(localStorage.getItem('jarvis_model') || 'google/gemini-2.0-flash-001');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSecurityMode, setIsSecurityMode] = useState(false);
  const [isVisualizerEnabled, setIsVisualizerEnabled] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isScanMode, setIsScanMode] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  // UI States
  const [isTracking, setIsTracking] = useState(false);
  const [isCamVisible, setIsCamVisible] = useState(false);
  const [isMatrixEnabled, setIsMatrixEnabled] = useState(true);
  const [cursorPos, setCursorPos] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const matrixCanvasRef = useRef(null);
  const capCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const trackCanvasRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // --- Matrix Effect ---
  useEffect(() => {
    const canvas = matrixCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 14;
    let drops = [];
    const initDrops = () => {
        const columns = canvas.width / fontSize;
        drops = [];
        for(let x=0; x<columns; x++) drops[x] = 1;
    };
    initDrops();

    let frameCount = 0;
    const draw = () => {
        if (!isMatrixEnabled) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        if (frameCount++ % 2 !== 0) {
            animationId = requestAnimationFrame(draw);
            return;
        }

        ctx.fillStyle = "rgba(5, 5, 5, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0"; 
        ctx.font = fontSize + "px monospace";

        for(let i=0; i<drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random()*chars.length));
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
    };
  }, [isMatrixEnabled]);

  // --- Command Palette Shortcut (Ctrl+K) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setIsPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Focus Mode Shortcut ---
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isFocusMode) {
            setIsFocusMode(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // --- Particle Canvas Resize ---
  useEffect(() => {
    const resizeParticles = () => {
        if (particleCanvasRef.current) {
            particleCanvasRef.current.width = window.innerWidth;
            particleCanvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', resizeParticles);
    resizeParticles();
    return () => window.removeEventListener('resize', resizeParticles);
  }, []);

  // --- Audio Visualizer Logic ---
  useEffect(() => {
    if (!isVisualizerEnabled || !audioCanvasRef.current) return;

    const canvas = audioCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = 200; // Fixed height for bottom bar
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 0.7;
            const hue = 180 + (barHeight / 255) * 60; // Cyan to Blue gradient
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.6)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        animationId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, [isVisualizerEnabled]);

  // --- Voice Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);

        // Voice Command: Toggle Focus Mode
        if (transcript.toLowerCase().includes('focus mode')) {
            setIsFocusMode(prev => !prev);
            // Note: Audio feedback might rely on updated state, handled by UI changes or separate effect
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // --- Text to Speech ---
  const speakResponse = (text) => {
    if (window.speechSynthesis && isVoiceEnabled) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1; u.pitch = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSendMessage = async (text) => {
    if (!apiKey) {
      setMessages(prev => [...prev, { sender: 'SYS', text: '⚠ AUTHENTICATION REQUIRED.' }]);
      setIsConfigOpen(true);
      return;
    }

    setMessages(prev => [...prev, { sender: 'USER', text }]);
    setMode('THINKING');

    try {
      const payload = {
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: text }
        ],
        model: currentModel
      };

      const rawResponse = await sendRequest(payload, apiKey);
      const finalResponse = executeCommands(rawResponse, { setMode, setTheme });
      
      setMessages(prev => [...prev, { sender: 'AI', text: finalResponse }]);
      speakResponse(finalResponse);
      setMode('IDLE');
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'SYS', text: `Error: ${err.message}` }]);
      setMode('IDLE');
    }
  };

  const handleSaveConfig = (key, model) => {
    if (key.startsWith('sk-or-v1')) {
      setApiKey(key);
      localStorage.setItem('jarvis_api_key', key);
      
      setCurrentModel(model);
      localStorage.setItem('jarvis_model', model);

      setIsConfigOpen(false);
      setMessages(prev => [...prev, { sender: 'SYS', text: 'Configuration updated. Neural Link established.' }]);
    } else {
      alert("Invalid Key Format");
    }
  };

  const handleSecurityToggle = () => {
    const newMode = !isSecurityMode;
    setIsSecurityMode(newMode);
    if (newMode) {
        setMode('ALERT');
        setMessages(prev => [...prev, { sender: 'AI', text: 'Security protocols engaged. Sentry mode active.' }]);
        speakResponse('Security protocols engaged. Sentry mode active.');
    } else {
        setMode('IDLE');
        setMessages(prev => [...prev, { sender: 'AI', text: 'Security protocols deactivated.' }]);
        speakResponse('Security protocols deactivated.');
    }
  };

  const handleVisualizerToggle = async () => {
    if (isVisualizerEnabled) {
        setIsVisualizerEnabled(false);
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;
            
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            setIsVisualizerEnabled(true);
        } catch (e) {
            setMessages(prev => [...prev, { sender: 'SYS', text: `Audio Error: ${e.message}` }]);
        }
    }
  };

  const handleNightModeToggle = () => {
    setIsNightMode(!isNightMode);
  };

  const handleMapToggle = () => {
    if (mode === 'MAP') {
        setMode('IDLE');
        setTheme({ h: 180, s: 100, l: 50 });
        speakResponse("Holo Map deactivated.");
    } else {
        setMode('MAP');
        setTheme({ h: 210, s: 100, l: 60 });
        speakResponse("Holo Map initialized.");
    }
  };

  const handleGlobeToggle = () => {
    if (mode === 'GLOBE') {
        setMode('IDLE');
        setTheme({ h: 180, s: 100, l: 50 });
        speakResponse("Holo Globe deactivated.");
    } else {
        setMode('GLOBE');
        setTheme({ h: 260, s: 100, l: 60 });
        speakResponse("Holo Globe initialized. Visualizing network traffic.");
    }
  };

  const handleClockToggle = () => {
    if (mode === 'CLOCK') {
        setMode('IDLE');
        setTheme({ h: 180, s: 100, l: 50 });
        speakResponse("Holo Clock deactivated.");
    } else {
        setMode('CLOCK');
        setTheme({ h: 120, s: 100, l: 60 });
        speakResponse("Holo Clock initialized.");
    }
  };

  const handleWeatherToggle = () => {
    if (mode === 'WEATHER') {
        setMode('IDLE');
        setTheme({ h: 180, s: 100, l: 50 });
        speakResponse("Weather monitoring deactivated.");
    } else {
        setMode('WEATHER');
        speakResponse("Scanning meteorological data...");
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                    const data = await response.json();
                    setWeatherData(data.current_weather);
                    
                    const code = data.current_weather.weathercode;
                    // 0: Clear, 1-3: Cloud, >3: Rain/Snow
                    if (code === 0) setTheme({ h: 45, s: 100, l: 60 }); // Gold for Sun
                    else if (code <= 3) setTheme({ h: 200, s: 20, l: 80 }); // Grey/White for Clouds
                    else setTheme({ h: 220, s: 100, l: 60 }); // Blue for Rain

                    speakResponse(`Current temperature: ${data.current_weather.temperature} degrees celsius. Windspeed: ${data.current_weather.windspeed} kilometers per hour.`);
                } catch (error) {
                    speakResponse("Weather data unavailable.");
                    setMode('IDLE');
                }
            }, (err) => {
                speakResponse("Location access required for local weather.");
                setMode('IDLE');
            });
        } else {
            speakResponse("Geolocation not supported.");
        }
    }
  };

  const handleFocusModeToggle = () => {
    setIsFocusMode(!isFocusMode);
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Reset value so same file can be selected again
    event.target.value = '';

    if (!apiKey) {
        setMessages(prev => [...prev, { sender: 'SYS', text: '⚠ AUTHENTICATION REQUIRED.' }]);
        setIsConfigOpen(true);
        return;
    }

    setMessages(prev => [...prev, { sender: 'SYS', text: `Analyzing file: ${file.name}...` }]);
    setMode('THINKING');

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        try {
             const payload = {
                model: currentModel,
                messages: [
                  { role: "system", content: systemInstruction },
                  { role: "user", content: [
                      { type: "text", text: "Analyze this uploaded image. Describe it and check for anomalies." },
                      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
                  ]}
                ]
              };

              const rawResponse = await sendRequest(payload, apiKey);
              const finalResponse = executeCommands(rawResponse, { setMode, setTheme });
              
              setMessages(prev => [...prev, { sender: 'AI', text: finalResponse }]);
              speakResponse(finalResponse);
              setMode('IDLE');
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'SYS', text: `Analysis Error: ${err.message}` }]);
            setMode('IDLE');
        }
    };
    reader.readAsDataURL(file);
  };

  const handleVisionScan = async () => {
    if (!apiKey) {
      setMessages(prev => [...prev, { sender: 'SYS', text: '⚠ AUTHENTICATION REQUIRED.' }]);
      setIsConfigOpen(true);
      return;
    }

    const video = videoRef.current;
    const canvas = capCanvasRef.current;

    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setMessages(prev => [...prev, { sender: 'SYS', text: '⚠ CAMERA OFFLINE. Enable tracking first.' }]);
      return;
    }

    setMessages(prev => [...prev, { sender: 'USER', text: '[INITIATING VISUAL SCAN...]' }]);
    setMode('THINKING');

    // Capture Frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const payload = {
        model: currentModel,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: [
              { type: "text", text: "Analyze this image. Identify key objects, people, and assess any potential security threats. Keep it concise." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
          ]}
        ]
      };

      const rawResponse = await sendRequest(payload, apiKey);
      const finalResponse = executeCommands(rawResponse, { setMode, setTheme });
      
      setMessages(prev => [...prev, { sender: 'AI', text: finalResponse }]);
      speakResponse(finalResponse);
      setMode('IDLE');
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'SYS', text: `Visual Scan Error: ${err.message}` }]);
      setMode('IDLE');
    }
  };

  const handleSaveChat = () => {
    const log = messages.map(msg => `[${msg.sender}] ${msg.text}`).join('\n');
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_log_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDiagnostics = async () => {
    setMode('THINKING');
    const steps = [
        'Initiating Core Diagnostics...',
        'Verifying Neural Pathways...',
        'Checking Sensor Integrity...',
        'Optimizing Memory Banks...',
        'Diagnostics Complete. All Systems Nominal.'
    ];
    
    for (const step of steps) {
        setMessages(prev => [...prev, { sender: 'SYS', text: step }]);
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    setMode('IDLE');
  };

  const handleReboot = () => {
    setMessages([{ sender: 'SYS', text: '⚠ SYSTEM REBOOT INITIATED...' }]);
    
    setTimeout(() => {
        setMessages([{ sender: 'AI', text: 'J.A.R.V.I.S. Core V5.0 Online. Voice & File Systems Active.' }]);
        resetHologram();
        setMode('IDLE');
        setTheme({ h: 180, s: 100, l: 50 });
        setIsSecurityMode(false);
    }, 1500);
  };

  const handleTrackInit = async () => {
    if (!modelRef.current) {
        // Load model
        const modelParams = {
            flipHorizontal: true,
            imageScaleFactor: 0.3, // Optimized for maximum speed
            maxNumBoxes: 2,
            iouThreshold: 0.6,
            scoreThreshold: 0.70, 
        };
        // Assuming handTrack is global from script tag
        if (window.handTrack) {
            modelRef.current = await window.handTrack.load(modelParams);
            startTracking();
        } else {
            console.error("handTrack library not loaded");
        }
    } else {
        if (isTracking) {
            setIsTracking(false);
            setIsCamVisible(false);
            window.handTrack.stopVideo(videoRef.current);
            updateInput(0, 0, 1, false);
        } else {
            startTracking();
        }
    }
  };

  const startTracking = () => {
      window.handTrack.startVideo(videoRef.current).then(status => {
          if (status) {
              setIsTracking(true);
              setIsCamVisible(true);
              runDetection();
          }
      });
  };

  const runDetection = async () => {
      if (!modelRef.current || !videoRef.current) return;
      // We use a loop inside useEffect or recursive requestAnimationFrame
      // But here we need to check isTracking state. 
      // A ref for isTracking is better for loops.
      
      const detect = async () => {
          if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
              const predictions = await modelRef.current.detect(videoRef.current);
              
              // Draw Visual Feedback
              if (trackCanvasRef.current) {
                  const ctx = trackCanvasRef.current.getContext('2d');
                  if (trackCanvasRef.current.width !== videoRef.current.videoWidth) {
                      trackCanvasRef.current.width = videoRef.current.videoWidth;
                      trackCanvasRef.current.height = videoRef.current.videoHeight;
                  }
                  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                  
                  predictions.forEach(prediction => {
                      const [x, y, width, height] = prediction.bbox;
                      ctx.strokeStyle = 'rgba(0, 255, 204, 0.8)';
                      ctx.lineWidth = 2;
                      ctx.strokeRect(x, y, width, height);
                      
                      ctx.fillStyle = 'rgba(0, 255, 204, 0.8)';
                      ctx.font = '12px monospace';
                      ctx.fillText(prediction.label.toUpperCase(), x + 5, y + 15);

                      // --- SCAN MODE OVERLAY ---
                      if (isScanMode && prediction.label === 'point') {
                          const cx = x + width / 2;
                          const cy = y; // Tip of finger approx
                          
                          // Draw Target Reticle
                          ctx.strokeStyle = '#ff0055';
                          ctx.lineWidth = 2;
                          ctx.beginPath();
                          ctx.arc(cx, cy, 30, 0, Math.PI * 2);
                          ctx.stroke();
                          
                          // Draw Data Lines
                          ctx.fillStyle = '#ff0055';
                          ctx.fillText(`TARGET LOCKED: [${Math.round(cx)}, ${Math.round(cy)}]`, cx + 40, cy);
                      }
                  });
              }

              if (predictions.length > 0) {
                  const p = predictions[0];
                  const bbox = p.bbox;
                  const gestureLabel = p.label;
                  
                  const normX = ((bbox[0] + bbox[2]/2) / videoRef.current.width * 2) - 1;
                  const normY = ((bbox[1] + bbox[3]/2) / videoRef.current.height * 2) - 1;
                  const scale = 0.8 + (bbox[2] / videoRef.current.width * 2);

                  // Update Cursor for Keyboard (0-1 range)
                  const cursorX = (bbox[0] + bbox[2]/2) / videoRef.current.width;
                  const cursorY = (bbox[1] + bbox[3]/2) / videoRef.current.height;
                  setCursorPos({ x: cursorX, y: cursorY });
                  
                  let x2 = 0, y2 = 0;
                  if (predictions.length > 1) {
                      const p2 = predictions[1];
                      const bbox2 = p2.bbox;
                      x2 = ((bbox2[0] + bbox2[2]/2) / videoRef.current.width * 2) - 1;
                      y2 = ((bbox2[1] + bbox2[3]/2) / videoRef.current.height * 2) - 1;
                  }

                  updateInput(normX, normY, scale, true, gestureLabel, predictions.length, x2, y2);
              } else {
                  updateInput(0, 0, 1, false);
                  setCursorPos(null);
              }
              requestAnimationFrame(detect);
          }
      };
      detect();
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleKeyPress = (key) => {
    if (key === 'DEL') {
        setInputText(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
        setInputText(prev => prev + ' ');
    } else {
        if (key === 'ENTER') {
            if (inputText.trim()) {
                handleSendMessage(inputText);
                setInputText('');
            }
        } else {
        setInputText(prev => prev + key);
        }
    }
  };

  const commands = [
      { id: 'toggle-track', label: isTracking ? 'Terminate Tracking' : 'Init Hand Tracking', action: handleTrackInit },
      { id: 'toggle-cam', label: isCamVisible ? 'Hide Camera' : 'Show Camera', action: () => setIsCamVisible(!isCamVisible) },
      { id: 'toggle-matrix', label: isMatrixEnabled ? 'Disable Matrix' : 'Enable Matrix', action: () => setIsMatrixEnabled(!isMatrixEnabled) },
      { id: 'toggle-voice', label: isVoiceEnabled ? 'Disable TTS' : 'Enable TTS', action: () => setIsVoiceEnabled(!isVoiceEnabled) },
      { id: 'toggle-security', label: isSecurityMode ? 'Disarm Security' : 'Arm Security', action: handleSecurityToggle },
      { id: 'toggle-vis', label: isVisualizerEnabled ? 'Disable Visualizer' : 'Enable Visualizer', action: handleVisualizerToggle },
      { id: 'toggle-keyboard', label: isKeyboardOpen ? 'Hide Keyboard' : 'Show Keyboard', action: () => setIsKeyboardOpen(!isKeyboardOpen) },
      { id: 'toggle-scan', label: isScanMode ? 'Disable AR Scan' : 'Enable AR Scan', action: () => setIsScanMode(!isScanMode) },
      { id: 'toggle-night', label: isNightMode ? 'Disable Night Mode' : 'Enable Night Mode', action: handleNightModeToggle },
      { id: 'toggle-map', label: mode === 'MAP' ? 'Close Holo-Map' : 'Open Holo-Map', action: handleMapToggle },
      { id: 'toggle-globe', label: mode === 'GLOBE' ? 'Close Holo-Globe' : 'Open Holo-Globe', action: handleGlobeToggle },
      { id: 'toggle-weather', label: mode === 'WEATHER' ? 'Close Weather' : 'Open Weather', action: handleWeatherToggle },
      { id: 'toggle-clock', label: mode === 'CLOCK' ? 'Close Clock' : 'Open Clock', action: handleClockToggle },
      { id: 'toggle-dash', label: isDashboardOpen ? 'Close Dashboard' : 'Open Dashboard', action: () => setIsDashboardOpen(!isDashboardOpen) },
      { id: 'toggle-focus', label: isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode', action: handleFocusModeToggle },
      { id: 'sys-reboot', label: 'System Reboot', action: handleReboot },
      { id: 'sys-diag', label: 'Run Diagnostics', action: handleDiagnostics },
      { id: 'save-log', label: 'Save Chat Log', action: handleSaveChat },
      { id: 'vision-scan', label: 'Perform Vision Scan', action: handleVisionScan },
  ];

  return (
    <div className={`App ${isFocusMode ? 'focus-mode' : ''}`}>
      <video id="video" ref={videoRef} className={`${isCamVisible ? 'visible' : ''} ${isNightMode ? 'night-mode' : ''}`}></video>
      <canvas id="particle-canvas" ref={particleCanvasRef}></canvas>
      <canvas id="audio-canvas" ref={audioCanvasRef} style={{ display: isVisualizerEnabled ? 'block' : 'none' }}></canvas>
      <canvas id="track-canvas" ref={trackCanvasRef} className={isCamVisible ? 'visible' : ''}></canvas>
      <canvas id="matrix-canvas" ref={matrixCanvasRef}></canvas>
      <canvas id="cap-canvas" ref={capCanvasRef} style={{display: 'none'}}></canvas>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

      <Hologram state={state} mode={mode} weatherData={weatherData} />
      
      <LeftPanel 
        onConfigClick={() => setIsConfigOpen(true)}
        onTrackClick={handleTrackInit}
        onScanClick={handleVisionScan}
        onCamToggle={() => setIsCamVisible(!isCamVisible)}
        onMatrixToggle={() => setIsMatrixEnabled(!isMatrixEnabled)}
        onVoiceToggle={() => setIsVoiceEnabled(!isVoiceEnabled)}
        onSecurityToggle={handleSecurityToggle}
        onSaveLog={handleSaveChat}
        onDiagnostics={handleDiagnostics}
        onVisualizerToggle={handleVisualizerToggle}
        onKeyboardToggle={() => setIsKeyboardOpen(!isKeyboardOpen)}
        onScanModeToggle={() => setIsScanMode(!isScanMode)}
        onNightModeToggle={handleNightModeToggle}
        onMapToggle={handleMapToggle}
        onGlobeToggle={handleGlobeToggle}
        onWeatherToggle={handleWeatherToggle}
        onClockToggle={handleClockToggle}
        onDashboardToggle={() => setIsDashboardOpen(!isDashboardOpen)}
        onFocusModeToggle={handleFocusModeToggle}
        isVisualizerEnabled={isVisualizerEnabled}
        isKeyboardOpen={isKeyboardOpen}
        isScanMode={isScanMode}
        onReboot={handleReboot}
        status={mode}
        gesture={gesture}
        fps={60}
        isTracking={isTracking}
        isCamVisible={isCamVisible}
        isMatrixEnabled={isMatrixEnabled}
        isVoiceEnabled={isVoiceEnabled}
        isSecurityMode={isSecurityMode}
        isNightMode={isNightMode}
        isMapMode={mode === 'MAP'}
        isGlobeMode={mode === 'GLOBE'}
        isWeatherMode={mode === 'WEATHER'}
        isClockMode={mode === 'CLOCK'}
        isDashboardOpen={isDashboardOpen}
        isFocusMode={isFocusMode}
      />

      <ChatPanel messages={messages} />

      <InputArea 
        onSend={handleSendMessage} 
        onUpload={handleFileUpload}
        onMic={handleMicClick}
        loading={loading}
        inputValue={inputText}
        onInputChange={setInputText}
        isListening={isListening}
      />

      {isKeyboardOpen && (
        <HoloKeyboard 
            onKeyPress={handleKeyPress} 
            cursorPos={cursorPos} 
            isInteracting={gesture === 'POINT'} 
        />
      )}

      <NewsTicker />

      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        commands={commands} 
      />

      <ConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onSave={handleSaveConfig}
        initialKey={apiKey}
        initialModel={currentModel}
      />

      <SystemDashboard 
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </div>
  );
}

export default App;
