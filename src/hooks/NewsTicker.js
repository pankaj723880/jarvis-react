import React from 'react';

const NewsTicker = () => {
    const headlines = [
        "J.A.R.V.I.S. SYSTEM UPDATE 5.0.1 AVAILABLE",
        "GLOBAL NETWORK TRAFFIC: STABLE",
        "NEURAL LINK CONNECTION: OPTIMAL",
        "WEATHER ALERT: ION STORM DETECTED IN SECTOR 7",
        "MARKET UPDATE: STARK INDUSTRIES UP 4.2%",
        "SECURITY PROTOCOLS: ACTIVE",
        "QUANTUM PROCESSING UNIT: ONLINE",
        "SATELLITE UPLINK ESTABLISHED: 100%"
    ];

    return (
        <div id="news-ticker">
            <div className="ticker-content">
                {headlines.map((item, i) => (
                    <span key={i} className="ticker-item">◆ {item}</span>
                ))}
                {headlines.map((item, i) => (
                    <span key={`dup-${i}`} className="ticker-item">◆ {item}</span>
                ))}
            </div>
        </div>
    );
};

export default NewsTicker;