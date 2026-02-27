import React from 'react';
import { exportPDF } from '../services/api';

export default function Header({ modelTrained, onRefresh, refreshing }) {
    const handleExport = async () => {
        try {
            const res = await exportPDF();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'yatrilounge_report.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Export failed. Please train the model first.');
        }
    };

    return (
        <header className="header">
            <div className="header-brand">
                <span className="header-logo">✈️</span>
                <div>
                    <div className="header-title">YatriLounge</div>
                    <div className="header-subtitle">Intelligent Airport Lounge Peak-Hour Predictor</div>
                </div>
            </div>
            <div className="header-actions">
                {modelTrained && (
                    <div className="header-status">
                        <span className="status-dot"></span>
                        Model Active
                    </div>
                )}
                {modelTrained && (
                    <>
                        <button className="btn btn-secondary" onClick={onRefresh} disabled={refreshing}>
                            {refreshing ? <span className="spinner"></span> : '🔄'} Refresh
                        </button>
                        <button className="btn btn-primary" onClick={handleExport}>
                            📄 Export PDF
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
