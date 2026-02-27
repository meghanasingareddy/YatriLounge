import React, { useCallback, useState } from 'react';

export default function FileUpload({ label, icon, accept, onUpload }) {
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleFile = useCallback(async (file) => {
        if (!file) return;
        setStatus('uploading');
        setMessage('Uploading...');
        try {
            const res = await onUpload(file);
            setStatus('success');
            setMessage(res.data.message + ` (${res.data.rows_inserted} rows)`);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.detail || 'Upload failed');
        }
    }, [onUpload]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    const onChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const zoneClass = `upload-zone ${dragging ? 'dragging' : ''} ${status === 'success' ? 'success' : ''}`;

    return (
        <div>
            <label
                className={zoneClass}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                <input
                    type="file"
                    accept={accept || '.csv'}
                    onChange={onChange}
                    style={{ display: 'none' }}
                />
                <div className="upload-icon">{icon || '📁'}</div>
                <div className="upload-text">
                    <strong>Drop {label} CSV here</strong> or click to browse
                </div>
                {status === 'uploading' && (
                    <div style={{ marginTop: 10 }} className="loading-overlay">
                        <span className="spinner"></span> Uploading...
                    </div>
                )}
            </label>
            {message && (
                <div className={`alert ${status === 'success' ? 'alert-success' : status === 'error' ? 'alert-error' : 'alert-info'}`} style={{ marginTop: 10 }}>
                    {status === 'success' ? '✅' : status === 'error' ? '❌' : 'ℹ️'} {message}
                </div>
            )}
        </div>
    );
}
