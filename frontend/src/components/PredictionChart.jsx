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
            arrowcolor: '#dc2626',
            font: { color: '#dc2626', size: 12, family: 'Inter' },
            bgcolor: '#fef2f2',
            bordercolor: '#dc2626',
            borderpad: 4,
            ay: -35,
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
        p.is_peak ? '#dc2626' : '#4f46e5'
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
                        fillcolor: 'rgba(79,70,229,0.06)',
                        line: {
                            color: '#4f46e5',
                            width: 2.5,
                            shape: 'spline',
                        },
                        marker: {
                            color: markerColors,
                            size: 8,
                            line: { color: '#ffffff', width: 2 },
                        },
                        name: 'Predicted Crowd',
                    },
                ]}
                layout={{
                    autosize: true,
                    height: 300,
                    margin: { l: 45, r: 15, t: 15, b: 45 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { family: 'Inter', color: '#5f6577' },
                    xaxis: {
                        title: { text: 'Hour', font: { size: 11, color: '#8c91a1' } },
                        gridcolor: '#eef0f4',
                        tickfont: { size: 11 },
                    },
                    yaxis: {
                        title: { text: 'Crowd Level', font: { size: 11, color: '#8c91a1' } },
                        gridcolor: '#eef0f4',
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
