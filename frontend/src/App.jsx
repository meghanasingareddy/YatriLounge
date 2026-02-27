import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import PredictionChart from './components/PredictionChart';
import MetricsPanel from './components/MetricsPanel';
import StaffingTable from './components/StaffingTable';
import MenuCards from './components/MenuCards';
import WhatIfSimulator from './components/WhatIfSimulator';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import {
    uploadFlights,
    uploadLoungeEntries,
    trainModel,
    getForecast,
    getMetrics,
    getStaffing,
    getMenu,
} from './services/api';

export default function App() {
    const [modelTrained, setModelTrained] = useState(false);
    const [training, setTraining] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [staffing, setStaffing] = useState(null);
    const [menu, setMenu] = useState(null);
    const [alert, setAlert] = useState(null);
    const [flightsUploaded, setFlightsUploaded] = useState(false);
    const [loungeUploaded, setLoungeUploaded] = useState(false);

    const refreshIntervalRef = useRef(null);

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 5000);
    };

    const loadDashboardData = useCallback(async () => {
        try {
            const [forecastRes, metricsRes, staffRes, menuRes] = await Promise.all([
                getForecast(),
                getMetrics(),
                getStaffing(),
                getMenu(),
            ]);
            setForecast(forecastRes.data);
            setMetrics(metricsRes.data);
            setStaffing(staffRes.data);
            setMenu(menuRes.data);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    }, []);

    const handleTrain = async () => {
        setTraining(true);
        try {
            await trainModel();
            setModelTrained(true);
            showAlert('success', '🎉 Model trained successfully! Loading predictions...');
            await loadDashboardData();
        } catch (err) {
            showAlert('error', err.response?.data?.detail || 'Training failed');
        }
        setTraining(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
        showAlert('success', '🔄 Dashboard refreshed with latest predictions');
    };

    const handleFlightUpload = async (file) => {
        const res = await uploadFlights(file);
        setFlightsUploaded(true);
        return res;
    };

    const handleLoungeUpload = async (file) => {
        const res = await uploadLoungeEntries(file);
        setLoungeUploaded(true);
        return res;
    };

    // Auto-refresh every 60 seconds when model is trained
    useEffect(() => {
        if (modelTrained) {
            refreshIntervalRef.current = setInterval(() => {
                loadDashboardData();
            }, 60000);
        }
        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        };
    }, [modelTrained, loadDashboardData]);

    const canTrain = flightsUploaded && loungeUploaded;

    return (
        <div className="app">
            <Header
                modelTrained={modelTrained}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />

            <main className="main-content">
                {alert && (
                    <div className={`alert alert-${alert.type}`}>
                        {alert.msg}
                    </div>
                )}

                {/* Step 1: Data Upload */}
                {!modelTrained && (
                    <section className="section" id="upload-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <span className="section-icon">📤</span>
                                Step 1: Upload Data
                            </h2>
                        </div>
                        <div className="grid-2">
                            <FileUpload
                                label="Flight Schedule"
                                icon="🛫"
                                onUpload={handleFlightUpload}
                            />
                            <FileUpload
                                label="Lounge Entries"
                                icon="🏢"
                                onUpload={handleLoungeUpload}
                            />
                        </div>
                    </section>
                )}

                {/* Step 2: Train Model */}
                {!modelTrained && (
                    <section className="section" id="train-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <span className="section-icon">🧠</span>
                                Step 2: Train Prediction Model
                            </h2>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            {!canTrain ? (
                                <div className="empty-state" style={{ padding: 0 }}>
                                    <div className="empty-state-icon">⬆️</div>
                                    <div className="empty-state-text">
                                        Upload both CSV files above to enable model training
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
                                        Both datasets uploaded. Ready to train the Gradient Boosting crowd predictor.
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleTrain}
                                        disabled={training}
                                        style={{ fontSize: 15, padding: '14px 32px' }}
                                    >
                                        {training ? (
                                            <><span className="spinner"></span> Training Model...</>
                                        ) : (
                                            '🚀 Train & Predict'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* Dashboard */}
                {modelTrained && (
                    <>
                        {/* Metrics */}
                        <section className="section" id="metrics-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">📈</span>
                                    Model Performance & Key Metrics
                                </h2>
                            </div>
                            <MetricsPanel metrics={metrics} forecast={forecast} />
                        </section>

                        {/* Prediction Chart */}
                        <section className="section" id="prediction-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">📊</span>
                                    6-Hour Crowd Forecast
                                </h2>
                            </div>
                            {forecast ? (
                                <PredictionChart predictions={forecast.predictions} />
                            ) : (
                                <div className="loading-overlay">
                                    <span className="spinner"></span> Loading forecast...
                                </div>
                            )}
                        </section>

                        {/* Staffing & Menu — side by side */}
                        <section className="section" id="recommendations-section">
                            <div className="grid-2">
                                <StaffingTable staffing={staffing} />
                                <MenuCards menu={menu} />
                            </div>
                        </section>

                        {/* What-If Simulation */}
                        <section className="section" id="simulation-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">🧪</span>
                                    Advanced: What-If Simulation
                                </h2>
                            </div>
                            <WhatIfSimulator />
                        </section>

                        {/* Historical Data Analysis */}
                        <section className="section" id="historical-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">📜</span>
                                    Historical Data Analysis
                                </h2>
                            </div>
                            <HistoricalAnalysis />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
