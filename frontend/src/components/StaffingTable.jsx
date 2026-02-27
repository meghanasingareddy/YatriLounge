import React from 'react';

export default function StaffingTable({ staffing }) {
    if (!staffing || !staffing.staffing || staffing.staffing.length === 0) return null;

    const peakStaff = Math.max(...staffing.staffing.map(s => s.recommended_staff));

    return (
        <div className="card">
            <div className="section-header" style={{ marginBottom: 14 }}>
                <h3 className="section-title">
                    <span className="section-icon">👥</span>
                    Staffing Recommendations
                </h3>
                <div className="stat-card" style={{ padding: '8px 16px', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <span className="stat-label" style={{ margin: 0 }}>Max Staff:</span>
                    <span className="stat-value emerald" style={{ fontSize: 20 }}>{staffing.total_staff_needed}</span>
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Hour</th>
                        <th>Predicted Crowd</th>
                        <th>Staff Needed</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {staffing.staffing.map((s, i) => (
                        <tr key={i} className={s.recommended_staff === peakStaff ? 'peak-row' : ''}>
                            <td>{new Date(s.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{Math.round(s.predicted_crowd)}</td>
                            <td>
                                <strong>{s.recommended_staff}</strong>
                            </td>
                            <td>
                                {s.recommended_staff === peakStaff ? (
                                    <span className="peak-badge">⚡ Peak Load</span>
                                ) : s.recommended_staff >= 6 ? (
                                    <span style={{ color: 'var(--accent-amber)' }}>🟡 High</span>
                                ) : (
                                    <span style={{ color: 'var(--accent-emerald)' }}>🟢 Normal</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
