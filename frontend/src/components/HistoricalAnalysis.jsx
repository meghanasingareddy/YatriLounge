import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { getHistoricalAnalysis } from '../services/api';

export default function HistoricalAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getHistoricalAnalysis();
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load analysis');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <span className="spinner"></span> Loading historical analysis...
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-error">❌ {error}</div>;
    }

    if (!data) return null;

    const { summary, hourly_pattern, daily_pattern, peak_records, daily_trend, airline_stats } = data;

    return (
        <div>
            {/* Summary Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <span className="stat-label">Data Coverage</span>
                    <span className="stat-value indigo">{summary.total_days}</span>
                    <span className="stat-sub">days of data</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Lounge Entries</span>
                    <span className="stat-value pink">{summary.total_lounge_entries.toLocaleString()}</span>
                    <span className="stat-sub">across all hours</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Avg per Hour</span>
                    <span className="stat-value cyan">{summary.avg_entries_per_hour}</span>
                    <span className="stat-sub">entries/hour average</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Peak Record</span>
                    <span className="stat-value amber">{summary.max_entries_in_hour}</span>
                    <span className="stat-sub">max in a single hour</span>
                </div>
            </div>

            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <span className="stat-label">Busiest Hour</span>
                    <span className="stat-value emerald">{summary.busiest_hour}:00</span>
                    <span className="stat-sub">highest avg entries</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Quietest Hour</span>
                    <span className="stat-value red">{summary.quietest_hour}:00</span>
                    <span className="stat-sub">lowest avg entries</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Weekend Avg</span>
                    <span className="stat-value amber">{summary.weekend_avg}</span>
                    <span className="stat-sub">entries/hour</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Weekday Avg</span>
                    <span className="stat-value cyan">{summary.weekday_avg}</span>
                    <span className="stat-sub">entries/hour</span>
                </div>
            </div>

            {/* Hourly Pattern Chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 className="section-title" style={{ marginBottom: 14 }}>
                    <span className="section-icon">⏰</span>
                    Hourly Crowd Pattern (Average)
                </h3>
                <Plot
                    data={[{
                        x: hourly_pattern.map((h) => `${h.hour}:00`),
                        y: hourly_pattern.map((h) => h.avg_entries),
                        type: 'bar',
                        marker: {
                            color: hourly_pattern.map((h) =>
                                h.avg_entries > 60 ? '#ec4899' : h.avg_entries > 30 ? '#f59e0b' : '#6366f1'
                            ),
                            line: { color: 'rgba(255,255,255,0.1)', width: 1 },
                        },
                        name: 'Avg Entries',
                    }]}
                    layout={{
                        autosize: true,
                        height: 280,
                        margin: { l: 45, r: 15, t: 10, b: 45 },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { family: 'Inter', color: '#94a3b8' },
                        xaxis: { title: 'Hour of Day', gridcolor: 'rgba(255,255,255,0.04)' },
                        yaxis: { title: 'Avg Entries', gridcolor: 'rgba(255,255,255,0.04)', rangemode: 'tozero' },
                        showlegend: false,
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler
                    style={{ width: '100%' }}
                />
            </div>

            {/* Daily Pattern + Daily Trend side by side */}
            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Weekly Pattern */}
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        <span className="section-icon">📅</span>
                        Weekly Pattern
                    </h3>
                    <Plot
                        data={[{
                            x: daily_pattern.map((d) => d.day.substring(0, 3)),
                            y: daily_pattern.map((d) => d.avg_entries),
                            type: 'bar',
                            marker: {
                                color: daily_pattern.map((d, i) =>
                                    i >= 5 ? '#ec4899' : '#6366f1'
                                ),
                            },
                            name: 'Avg Entries',
                        }]}
                        layout={{
                            autosize: true,
                            height: 240,
                            margin: { l: 40, r: 10, t: 10, b: 35 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { family: 'Inter', color: '#94a3b8', size: 11 },
                            xaxis: { gridcolor: 'rgba(255,255,255,0.04)' },
                            yaxis: { gridcolor: 'rgba(255,255,255,0.04)', rangemode: 'tozero' },
                            showlegend: false,
                        }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler
                        style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                        🟣 Weekday &nbsp;&nbsp; 🩷 Weekend
                    </div>
                </div>

                {/* Daily Trend */}
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        <span className="section-icon">📈</span>
                        Daily Total Trend
                    </h3>
                    <Plot
                        data={[{
                            x: daily_trend.map((d) => d.date),
                            y: daily_trend.map((d) => d.total_entries),
                            type: 'scatter',
                            mode: 'lines+markers',
                            fill: 'tozeroy',
                            fillcolor: 'rgba(99,102,241,0.08)',
                            line: { color: '#6366f1', width: 2, shape: 'spline' },
                            marker: { size: 5, color: '#818cf8' },
                            name: 'Total Entries',
                        }]}
                        layout={{
                            autosize: true,
                            height: 240,
                            margin: { l: 40, r: 10, t: 10, b: 35 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { family: 'Inter', color: '#94a3b8', size: 10 },
                            xaxis: { gridcolor: 'rgba(255,255,255,0.04)', tickangle: -45 },
                            yaxis: { gridcolor: 'rgba(255,255,255,0.04)', rangemode: 'tozero' },
                            showlegend: false,
                        }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Peak Records & Airline Stats side by side */}
            <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* Top 5 Peak Records */}
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        <span className="section-icon">🔥</span>
                        Top 5 Busiest Hours (All Time)
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date & Time</th>
                                <th>Entries</th>
                            </tr>
                        </thead>
                        <tbody>
                            {peak_records.map((p, i) => (
                                <tr key={i} className={i === 0 ? 'peak-row' : ''}>
                                    <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                                    <td>{p.timestamp}</td>
                                    <td><strong>{p.entries}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Airline Stats */}
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        <span className="section-icon">🛩️</span>
                        Airline Statistics
                    </h3>
                    {airline_stats.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Airline</th>
                                    <th>Flights</th>
                                    <th>Avg Pax</th>
                                    <th>Total Pax</th>
                                </tr>
                            </thead>
                            <tbody>
                                {airline_stats.map((a, i) => (
                                    <tr key={i}>
                                        <td>{a.airline}</td>
                                        <td>{a.flights}</td>
                                        <td>{a.avg_passengers}</td>
                                        <td><strong>{a.total_passengers.toLocaleString()}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state" style={{ padding: 20 }}>
                            <div className="empty-state-text">No flight data uploaded yet</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
