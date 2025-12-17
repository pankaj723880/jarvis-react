import React, { useEffect, useState, useRef } from 'react';

const SystemDashboard = ({ isOpen, onClose }) => {
    const [cpuData, setCpuData] = useState(new Array(20).fill(0));
    const [memData, setMemData] = useState(new Array(20).fill(0));
    const [netUpData, setNetUpData] = useState(new Array(20).fill(0));
    const [netDownData, setNetDownData] = useState(new Array(20).fill(0));
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setCpuData(prev => [...prev.slice(1), Math.random() * 100]);
            setMemData(prev => [...prev.slice(1), 30 + Math.random() * 20]); // Base 30%, fluctuate
            setNetUpData(prev => [...prev.slice(1), Math.random() * 50]);
            setNetDownData(prev => [...prev.slice(1), Math.random() * 80]);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        ctx.clearRect(0, 0, width, height);

        const drawGraph = (data, color, offsetY, scaleHeight) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            const step = width / (data.length - 1);
            
            data.forEach((val, i) => {
                const x = i * step;
                const y = offsetY - (val / 100) * scaleHeight;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        };

        const sectionH = height / 3;

        // CPU Graph
        drawGraph(cpuData, '#00ffcc', sectionH - 10, sectionH - 20);
        
        // Memory Graph
        drawGraph(memData, '#ffaa00', sectionH * 2 - 10, sectionH - 20);

        // Network Graph
        drawGraph(netUpData, '#ff3333', height - 10, sectionH - 20);
        drawGraph(netDownData, '#3388ff', height - 10, sectionH - 20);

        // Labels
        ctx.fillStyle = '#00ffcc';
        ctx.font = '10px monospace';
        ctx.fillText(`CPU: ${Math.round(cpuData[cpuData.length - 1])}%`, 5, 15);

        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`MEM: ${Math.round(memData[memData.length - 1])}%`, 5, sectionH + 15);

        ctx.fillStyle = '#3388ff';
        ctx.fillText(`NET ↓: ${Math.round(netDownData[netDownData.length - 1])} MB/s`, 5, sectionH * 2 + 15);
        ctx.fillStyle = '#ff3333';
        ctx.fillText(`NET ↑: ${Math.round(netUpData[netUpData.length - 1])} MB/s`, 120, sectionH * 2 + 15);

    }, [cpuData, memData, netUpData, netDownData, isOpen]);

    if (!isOpen) return null;

    return (
        <div id="system-dashboard">
            <div className="hud-header">
                <span>SYSTEM DIAGNOSTICS</span>
                <button onClick={onClose} style={{background:'transparent', border:'none', color:'var(--holo-color)', cursor:'pointer'}}>✕</button>
            </div>
            <canvas ref={canvasRef} width={370} height={300} style={{width: '100%'}}></canvas>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#aaa', marginTop:'10px'}}>
                <div>PROCESSES: {120 + Math.floor(Math.random() * 10)}</div>
                <div>UPTIME: 42:15:09</div>
                <div>TEMP: {45 + Math.floor(Math.random() * 5)}°C</div>
            </div>
        </div>
    );
};

export default SystemDashboard;