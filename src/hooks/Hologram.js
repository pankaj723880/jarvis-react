import React, { useEffect, useRef, useState } from 'react';

const Hologram = ({ state, mode, weatherData }) => {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        if (mode !== 'CLOCK') return;
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [mode]);

    // Use requestAnimationFrame to update styles directly for performance
    useEffect(() => {
        let animId;
        const render = () => {
            if (wrapperRef.current && containerRef.current) {
                const s = state;
                const c = s.current;
                
                let breathVal = 1 + Math.sin(s.breath) * 0.05;
                if (mode !== 'IDLE') breathVal = 1 + Math.sin(s.breath * 5) * 0.1;

                const style = containerRef.current.style;
                style.setProperty('--tx', `${c.tx}px`);
                style.setProperty('--ty', `${c.ty}px`);
                style.setProperty('--tz', `${c.tz}px`);
                style.setProperty('--rx', `${c.rx}deg`);
                style.setProperty('--ry', `${c.ry}deg`);
                style.setProperty('--rz', `${c.rz}deg`);
                style.setProperty('--scale', c.scale);
                style.setProperty('--breath', breathVal);
                style.setProperty('--explode', c.explode);
            }
            animId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animId);
    }, [state, mode]);

    // Helper to determine gesture class
    const getGestureClass = () => {
        // Gesture state is managed in useHoloCore but we can read from props if passed, 
        // or rely on the physics state if we stored gesture there. 
        // For now, we'll rely on the parent passing the gesture prop or just CSS classes.
        return ''; 
    };

    return (
        <div id="stage-container" ref={containerRef}>
            <div className={`holo-wrapper ${getGestureClass()}`} id="holo-wrapper" ref={wrapperRef}>
                <div className="holo-grid"></div>
                <div className="gyro-assembly">
                    <div className="gyro-ring ring-x"></div>
                    <div className="gyro-ring ring-y"></div>
                    <div className="gyro-ring ring-z"></div>
                </div>
                <div className="data-particles"></div>
                <div className="scan-line"></div>
                
                {mode === 'MAP' ? (
                    <div className="holo-globe">
                        <div className="globe-sphere"></div>
                        <div className="globe-ring g-ring-1"></div>
                        <div className="globe-ring g-ring-2"></div>
                    </div>
                ) : mode === 'GLOBE' ? (
                    <div className="holo-network-globe">
                        <div className="globe-wireframe"></div>
                        <div className="net-beam b1"></div>
                        <div className="net-beam b2"></div>
                        <div className="net-beam b3"></div>
                        <div className="net-node n1"></div>
                        <div className="net-node n2"></div>
                        <div className="net-node n3"></div>
                    </div>
                ) : mode === 'CLOCK' ? (
                    <div className="holo-clock">
                        <div className="clock-time">{time.toLocaleTimeString()}</div>
                        <div className="clock-date">{time.toLocaleDateString()}</div>
                        <div className="clock-ring"></div>
                    </div>
                ) : mode === 'WEATHER' && weatherData ? (
                    <div className="holo-weather">
                        {weatherData.weathercode === 0 ? (
                            <div className="weather-sun"></div>
                        ) : (weatherData.weathercode <= 3 || weatherData.weathercode === 45 || weatherData.weathercode === 48) ? (
                            <div className="weather-cloud">
                                <div className="cloud-part c1"></div>
                                <div className="cloud-part c2"></div>
                                <div className="cloud-part c3"></div>
                            </div>
                        ) : (weatherData.weathercode >= 71 && weatherData.weathercode <= 77) || (weatherData.weathercode >= 85 && weatherData.weathercode <= 86) ? (
                            <div className="weather-snow">
                                <div className="cloud-part c1"></div>
                                <div className="snow-flake s1"></div>
                                <div className="snow-flake s2"></div>
                                <div className="snow-flake s3"></div>
                            </div>
                        ) : weatherData.weathercode >= 95 ? (
                            <div className="weather-storm">
                                <div className="cloud-part c1"></div>
                                <div className="cloud-part c2"></div>
                                <div className="lightning l1"></div>
                            </div>
                        ) : (
                            <div className="weather-rain">
                                <div className="cloud-part c1"></div>
                                <div className="rain-drop d1"></div>
                                <div className="rain-drop d2"></div>
                                <div className="rain-drop d3"></div>
                            </div>
                        )}
                        
                        <div className="weather-details">
                            <div className="weather-row"><span>TEMP</span><span>{weatherData.temperature}°C</span></div>
                            <div className="weather-row"><span>WIND</span><span>{weatherData.windspeed} km/h</span></div>
                            <div className="weather-row"><span>DIR</span><span>{weatherData.winddirection}°</span></div>
                            <div className="weather-row"><span>CODE</span><span>{weatherData.weathercode}</span></div>
                        </div>
                    </div>
                ) : (
                    <div className="core-cube">
                        <div className="face f-front"></div>
                        <div className="face f-back"></div>
                        <div className="face f-right"></div>
                        <div className="face f-left"></div>
                        <div className="face f-top"></div>
                        <div className="face f-bottom"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hologram;