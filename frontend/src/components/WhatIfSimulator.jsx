import React, { useState } from 'react';
import { simulateAddFlight } from '../services/api';
import PredictionChart from './PredictionChart';

export default function WhatIfSimulator() {
    const [form, setForm] = useState({
        airline: '',
        passenger_count: '',
        arrival_time: '',
        departure_time: '',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                airline: form.airline,
                passenger_count: parseInt(form.passenger_count),
                arrival_time: new Date(form.arrival_time).toISOString(),
                departure_time: new Date(form.departure_time).toISOString(),
            };
            const res = await simulateAddFlight(payload);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Simulation failed');
        }
        setLoading(false);
    };

    return (
        <div className="card">
            <div className="section-header" style={{ marginBottom: 14 }}>
                <h3 className="section-title">
                    What-If Simulation
                </h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid-4" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Airline</label>
                        <select
                            className="form-select"
                            name="airline"
                            value={form.airline}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select airline</option>
                            <option value="Air India">Air India</option>
                            <option value="IndiGo">IndiGo</option>
                            <option value="SpiceJet">SpiceJet</option>
                            <option value="Vistara">Vistara</option>
                            <option value="GoAir">GoAir</option>
                            <option value="AirAsia India">AirAsia India</option>
                            <option value="Emirates">Emirates</option>
                            <option value="Singapore Airlines">Singapore Airlines</option>
                            <option value="Lufthansa">Lufthansa</option>
                            <option value="British Airways">British Airways</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Passengers</label>
                        <input
                            className="form-input"
                            name="passenger_count"
                            type="number"
                            placeholder="e.g. 200"
                            value={form.passenger_count}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Arrival Time</label>
                        <input
                            className="form-input"
                            name="arrival_time"
                            type="datetime-local"
                            value={form.arrival_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Departure Time</label>
                        <input
                            className="form-input"
                            name="departure_time"
                            type="datetime-local"
                            value={form.departure_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Simulating...</> : 'Run Simulation'}
                </button>
            </form>

            {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

            {result && (
                <div style={{ marginTop: 20 }}>
                    <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14 }}>Simulated Forecast (with new flight)</h4>
                    <PredictionChart predictions={result.simulated_predictions} />
                    <div className="impact-box">
                        <strong>Impact:</strong> {result.impact_summary}
                    </div>
                </div>
            )}
        </div>
    );
}
