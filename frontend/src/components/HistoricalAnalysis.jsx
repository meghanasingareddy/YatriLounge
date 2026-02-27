import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { getHistoricalAnalysis } from '../services/api';

export default function HistoricalAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [availableRange, setAvailableRange] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (start, end) => {
        setLoading(true);
        setError('');
        try {
            const res = await getHistoricalAnalysis(start, end);
            setData(res.data);
            if (res.data.available_range && !availableRange) {
                setAvailableRange(res.data.available_range);
                if (!start) setStartDate(res.data.available_range.start);
                if (!end) setEndDate(res.data.available_range.end);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load analysis');
        }
        setLoading(false);
    };

    const handleFilter = () => {
        loadData(startDate, endDate);
    };

    const handleReset = () => {
        if (availableRange) {
            setStartDate(availableRange.start);
            setEndDate(availableRange.end);
            loadData(availableRange.start, availableRange.end);
        }
    };

    if (loading && !data) {
        return (
            <div className="loading-overlay">
                <span className="spinner"></span> Loading historical analysis...
            </div>
        );
    }

    if (error && !data) {
        return <div className="alert alert-error">{error}</div>;
    }

    if (!data) return null;

    const { summary, hourly_pattern, daily_pattern, peak_records, daily_trend, airline_stats } = data;

    return (
        <div>
            {/* Date Range Filter */}
            <div className="card" style={{ marginBottom: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Date Range:
                    </span>
                    <input
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={availableRange?.start}
                        max={availableRange?.end}
                        style={{ width: 160 }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>to</span>
                    <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={availableRange?.start}
                        max={availableRange?.end}
                        style={{ width: 160 }}
                    />
                    <button className="btn btn-primary" onClick={handleFilter} disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Apply'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
                        Reset
                    </button>
                    {availableRange && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            Available: {availableRange.start} to {availableRange.end}
                        </span>
                    )}
                </div>
                {error && <div className="alert alert-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div>}
            </div>

            {/* Summary Stats */}
            <div className="grid-4" style={{ marginBottom: 16 }}>
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

            <div className="grid-4" style={{ marginBottom: 16 }}>
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
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="section-title" style={{ marginBottom: 14 }}>
                    Hourly Crowd Pattern (Average)
                </h3>
                <Plot
                    data={[{
                        x: hourly_pattern.map((h) => `${h.hour}:00`),
                        y: hourly_pattern.map((h) => h.avg_entries),
                        type: 'bar',
                        marker: {
                            color: hourly_pattern.map((h) =>
                                h.avg_entries > 60 ? '#dc2626' : h.avg_entries > 30 ? '#d97706' : '#4f46e5'
                            ),
                        },
                        name: 'Avg Entries',
                    }]}
                    layout={{
                        autosize: true,
                        height: 260,
                        margin: { l: 40, r: 10, t: 10, b: 40 },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { family: 'Inter', color: '#5f6577' },
                        xaxis: { title: 'Hour of Day', gridcolor: '#eef0f4', titlefont: { size: 11, color: '#8c91a1' } },
                        yaxis: { title: 'Avg Entries', gridcolor: '#eef0f4', rangemode: 'tozero', titlefont: { size: 11, color: '#8c91a1' } },
                        showlegend: false,
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler
                    style={{ width: '100%' }}
                />
            </div>

            {/* Weekly Pattern + Daily Trend */}
            <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        Weekly Pattern
                    </h3>
                    <Plot
                        data={[{
                            x: daily_pattern.map((d) => d.day.substring(0, 3)),
                            y: daily_pattern.map((d) => d.avg_entries),
                            type: 'bar',
                            marker: {
                                color: daily_pattern.map((d, i) =>
                                    i >= 5 ? '#dc2626' : '#4f46e5'
                                ),
                            },
                            name: 'Avg Entries',
                        }]}
                        layout={{
                            autosize: true,
                            height: 220,
                            margin: { l: 35, r: 10, t: 10, b: 30 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { family: 'Inter', color: '#5f6577', size: 11 },
                            xaxis: { gridcolor: '#eef0f4' },
                            yaxis: { gridcolor: '#eef0f4', rangemode: 'tozero' },
                            showlegend: false,
                        }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler
                        style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                        Indigo: Weekday, Red: Weekend
                    </div>
                </div>

                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        Daily Total Trend
                    </h3>
                    <Plot
                        data={[{
                            x: daily_trend.map((d) => d.date),
                            y: daily_trend.map((d) => d.total_entries),
                            type: 'scatter',
                            mode: 'lines+markers',
                            fill: 'tozeroy',
                            fillcolor: 'rgba(79,70,229,0.06)',
                            line: { color: '#4f46e5', width: 2, shape: 'spline' },
                            marker: { size: 4, color: '#4f46e5' },
                            name: 'Total Entries',
                        }]}
                        layout={{
                            autosize: true,
                            height: 220,
                            margin: { l: 35, r: 10, t: 10, b: 30 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { family: 'Inter', color: '#5f6577', size: 10 },
                            xaxis: { gridcolor: '#eef0f4', tickangle: -45 },
                            yaxis: { gridcolor: '#eef0f4', rangemode: 'tozero' },
                            showlegend: false,
                        }}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Peak Records & Airline Stats */}
            <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
                        Top 5 Busiest Hours
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
                                    <td>{i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `#${i + 1}`}</td>
                                    <td>{p.timestamp}</td>
                                    <td><strong>{p.entries}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>
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
                            <div className="empty-state-text">No flight data for selected range</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
