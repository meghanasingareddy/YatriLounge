import React from 'react';

export default function MetricsPanel({ metrics, forecast }) {
    if (!metrics && !forecast) return null;

    return (
        <div className="grid-4">
            {forecast && (
                <>
                    <div className="stat-card">
                        <span className="stat-label">Peak Hour</span>
                        <span className="stat-value pink">
                            {new Date(forecast.peak_hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="stat-sub">Highest crowd expected</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Peak Crowd</span>
                        <span className="stat-value amber">{Math.round(forecast.peak_crowd)}</span>
                        <span className="stat-sub">guests predicted</span>
                    </div>
                </>
            )}
            {metrics && (
                <>
                    <div className="stat-card">
                        <span className="stat-label">MAE</span>
                        <span className="stat-value cyan">{metrics.mae}</span>
                        <span className="stat-sub">Mean Absolute Error</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">RMSE</span>
                        <span className="stat-value indigo">{metrics.rmse}</span>
                        <span className="stat-sub">Root Mean Squared Error</span>
                    </div>
                </>
            )}
        </div>
    );
}
