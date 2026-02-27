import React from 'react';

export default function MenuCards({ menu }) {
    if (!menu || !menu.hourly || menu.hourly.length === 0) return null;

    return (
        <div className="card">
            <div className="section-header" style={{ marginBottom: 14 }}>
                <h3 className="section-title">
                    Menu Optimization
                </h3>
            </div>

            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                    <span className="stat-label">Total Snack Units</span>
                    <span className="stat-value amber">{menu.total_snack_units}</span>
                    <span className="stat-sub">60% allocation + 10% buffer</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Beverage Units</span>
                    <span className="stat-value cyan">{menu.total_beverage_units}</span>
                    <span className="stat-sub">40% allocation + 10% buffer</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Buffer Stock</span>
                    <span className="stat-value emerald">10%</span>
                    <span className="stat-sub">Safety margin included</span>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Hour</th>
                        <th>Crowd</th>
                        <th>Snacks</th>
                        <th>Beverages</th>
                    </tr>
                </thead>
                <tbody>
                    {menu.hourly.map((m, i) => (
                        <tr key={i}>
                            <td>{new Date(m.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{Math.round(m.predicted_crowd)}</td>
                            <td><strong>{m.snack_units}</strong></td>
                            <td><strong>{m.beverage_units}</strong></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
