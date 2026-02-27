import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

export default function PredictionChart({ predictions }) {
    const { hours, crowds, peakIndex, annotations } = useMemo(() => {
        if (!predictions || predictions.length === 0)
            return { hours: [], crowds: [], peakIndex: -1, annotations: [] };

        const h = predictions.map((p) => {
            const d = new Date(p.hour);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        const c = predictions.map((p) => p.predicted_crowd);
        const pi = predictions.findIndex((p) => p.is_peak);

        const ann = pi >= 0 ? [{
            x: h[pi],
            y: c[pi],
            text: `⭐ Peak: ${Math.round(c[pi])}`,
            showarrow: true,
            arrowhead: 2,
            arrowcolor: '#ec4899',
            font: { color: '#ec4899', size: 13, family: 'Inter' },
            bgcolor: 'rgba(236,72,153,0.12)',
            bordercolor: '#ec4899',
            borderpad: 5,
            ay: -40,
        }] : [];

        return { hours: h, crowds: c, peakIndex: pi, annotations: ann };
    }, [predictions]);

    if (!predictions || predictions.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-text">
                    No prediction data yet. Upload CSVs and train the model to see forecasts.
                </div>
            </div>
        );
    }

    const markerColors = predictions.map((p) =>
        p.is_peak ? '#ec4899' : '#6366f1'
    );

    return (
        <div className="chart-container">
            <Plot
                data={[
                    {
                        x: hours,
                        y: crowds,
                        type: 'scatter',
                        mode: 'lines+markers',
                        fill: 'tozeroy',
                        fillcolor: 'rgba(99,102,241,0.08)',
                        line: {
                            color: '#6366f1',
                            width: 3,
                            shape: 'spline',
                        },
                        marker: {
                            color: markerColors,
                            size: 10,
                            line: { color: '#1a1f35', width: 2 },
                        },
                        name: 'Predicted Crowd',
                    },
                ]}
                layout={{
                    autosize: true,
                    height: 340,
                    margin: { l: 50, r: 20, t: 20, b: 50 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { family: 'Inter', color: '#94a3b8' },
                    xaxis: {
                        title: { text: 'Hour', font: { size: 12 } },
                        gridcolor: 'rgba(255,255,255,0.04)',
                        tickfont: { size: 11 },
                    },
                    yaxis: {
                        title: { text: 'Crowd Level', font: { size: 12 } },
                        gridcolor: 'rgba(255,255,255,0.04)',
                        tickfont: { size: 11 },
                        rangemode: 'tozero',
                    },
                    annotations: annotations,
                    showlegend: false,
                }}
                config={{
                    displayModeBar: false,
                    responsive: true,
                }}
                useResizeHandler
                style={{ width: '100%' }}
            />
        </div>
    );
}
