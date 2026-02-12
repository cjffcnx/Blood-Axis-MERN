import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../components/shared/Layout/DashboardLayout';
import Spinner from '../../components/shared/Spinner';
import { getLatestForecast, generateForecast } from '../../services/forecastService';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './BloodForecast.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const BloodForecast = () => {
    const { user } = useSelector((state) => state.auth);
    const organisationId = user?.organisationId || user?._id;
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('A+');
    const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

    useEffect(() => {
        loadForecast();
    }, []);

    const loadForecast = async () => {
        try {
            setLoading(true);
            console.log('Loading forecast for organisation:', organisationId);
            const result = await getLatestForecast(organisationId);
            console.log('Forecast result received:', result);

            if (result.success && result.data) {
                console.log('Setting forecast data:', result.data);
                setForecast(result.data);

                // Auto-select first available blood group
                const availableGroups = BLOOD_GROUPS.filter(bg => result.data[bg] && result.data[bg].length > 0);
                if (availableGroups.length > 0 && !result.data[selectedBloodGroup]) {
                    console.log('Auto-selecting blood group:', availableGroups[0]);
                    setSelectedBloodGroup(availableGroups[0]);
                }
            } else {
                console.log('No forecast data available:', result);
                setForecast(null);
            }
        } catch (error) {
            console.error('Error loading forecast:', error);
            setForecast(null);
            toast.error('Failed to load forecast data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateForecast = async () => {
        try {
            setGenerating(true);
            toast.info('Generating forecast... This may take 30-60 seconds.');

            console.log('Generating forecast for organisation:', organisationId);
            const result = await generateForecast(organisationId);
            console.log('Generation result:', result);

            if (result.success) {
                toast.success('Forecast generated successfully!');
                // Wait a moment for data to be saved to DB
                setTimeout(async () => {
                    await loadForecast();
                }, 1000);
            } else {
                const errorMessage = result.errors && result.errors.length > 0
                    ? result.errors.join(', ')
                    : result.message || 'Failed to generate forecast';
                toast.error(errorMessage);
                console.error('Generation failed:', result);
            }
        } catch (error) {
            console.error('Error generating forecast:', error);
            toast.error(error || 'Failed to generate forecast');
        } finally {
            setGenerating(false);
        }
    };

    const getChartData = (bloodGroup) => {
        if (!forecast || !forecast[bloodGroup]) return null;

        const data = forecast[bloodGroup];
        const labels = data.map((d) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const forecastUnits = data.map((d) => d.units);
        const lowerBounds = data.map((d) => d.lowerBound);
        const upperBounds = data.map((d) => d.upperBound);

        return {
            labels,
            datasets: [
                {
                    label: 'Forecast (units)',
                    data: forecastUnits,
                    borderColor: 'rgb(220, 38, 38)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: 'Lower Bound',
                    data: lowerBounds,
                    borderColor: 'rgba(220, 38, 38, 0.3)',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
                {
                    label: 'Upper Bound',
                    data: upperBounds,
                    borderColor: 'rgba(220, 38, 38, 0.3)',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
            ],
        };
    };

    const getBarChartData = () => {
        if (!forecast) return null;

        const bloodGroups = BLOOD_GROUPS.filter((bg) => forecast[bg] && forecast[bg].length > 0);
        const totalDemand = bloodGroups.map((bg) => {
            return forecast[bg].reduce((sum, d) => sum + d.units, 0);
        });

        return {
            labels: bloodGroups,
            datasets: [
                {
                    label: '7-Day Total Forecast (units)',
                    data: totalDemand,
                    backgroundColor: [
                        'rgba(220, 38, 38, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(248, 113, 113, 0.8)',
                        'rgba(252, 165, 165, 0.8)',
                        'rgba(254, 202, 202, 0.8)',
                        'rgba(220, 38, 38, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                        'rgba(248, 113, 113, 0.6)',
                    ],
                    borderColor: 'rgb(220, 38, 38)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: `${selectedBloodGroup} Blood Group - 7 Day Forecast`,
                font: {
                    size: 16,
                    weight: 'bold',
                    family: "'Inter', sans-serif"
                },
                padding: {
                    bottom: 20
                },
                color: '#374151'
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y} units`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6'
                },
                title: {
                    display: true,
                    text: 'Blood Units',
                    font: {
                        family: "'Inter', sans-serif",
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Total 7-Day Demand by Blood Group',
                font: {
                    size: 16,
                    weight: 'bold',
                    family: "'Inter', sans-serif"
                },
                padding: {
                    bottom: 20
                },
                color: '#374151'
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6'
                },
                title: {
                    display: true,
                    text: 'Total Units',
                    font: {
                        family: "'Inter', sans-serif",
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
        },
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <Layout>
            <div className="blood-forecast-container">
                <div className="forecast-header">
                    <div>
                        <h1 className="page-title">Blood Demand Forecast</h1>
                        <p className="page-subtitle">AI-powered 7-day blood demand predictions</p>
                    </div>
                    <button
                        className={`btn-generate ${generating ? 'disabled' : ''}`}
                        onClick={handleGenerateForecast}
                        disabled={generating}
                    >
                        {generating ? 'Generating...' : 'Generate New Forecast'}
                    </button>
                </div>

                {!forecast ? (
                    <div className="no-forecast">
                        <div className="no-forecast-icon">📊</div>
                        <h2>No Forecast Available</h2>
                        <p>Click "Generate New Forecast" to create your first forecast.</p>
                        <p className="note">Uses recent history; with low data it will fall back to a short lookback (last ~2 hours).</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="forecast-summary">
                            {BLOOD_GROUPS.filter((bg) => forecast[bg] && forecast[bg].length > 0).map((bg) => {
                                const total = forecast[bg].reduce((sum, d) => sum + d.units, 0);
                                const avg = (total / forecast[bg].length).toFixed(1);
                                const avgConfidence = (
                                    forecast[bg].reduce((sum, d) => sum + d.confidence, 0) / forecast[bg].length
                                ).toFixed(2);

                                return (
                                    <div
                                        key={bg}
                                        className={`forecast-card ${selectedBloodGroup === bg ? 'active' : ''}`}
                                        onClick={() => setSelectedBloodGroup(bg)}
                                    >
                                        <div className="card-header">
                                            <span className="blood-group">{bg}</span>
                                            <span className="confidence-badge">{(avgConfidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="stat">
                                                <span className="stat-label">7-Day Total</span>
                                                <span className="stat-value">{total} units</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Daily Avg</span>
                                                <span className="stat-value">{avg} units</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Show message if selected blood group has no data */}
                        {(!forecast[selectedBloodGroup] || forecast[selectedBloodGroup].length === 0) && (
                            <div className="no-forecast" style={{ margin: '20px 0' }}>
                                <p>No forecast data available for {selectedBloodGroup}</p>
                                <p className="note">Select a blood group with available data from the cards above.</p>
                            </div>
                        )}

                        {/* Only show view toggle and charts if selected blood group has data */}
                        {forecast[selectedBloodGroup] && forecast[selectedBloodGroup].length > 0 && (
                            <>
                                {/* View Toggle */}
                                <div className="view-toggle">
                                    <button
                                        className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
                                        onClick={() => setViewMode('chart')}
                                    >
                                        📈 Charts
                                    </button>
                                    <button
                                        className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                                        onClick={() => setViewMode('table')}
                                    >
                                        📋 Table
                                    </button>
                                </div>

                                {/* Chart View */}
                                {viewMode === 'chart' && (
                                    <div className="charts-section">
                                        <div className="chart-container">
                                            {getChartData(selectedBloodGroup) ? (
                                                <Line data={getChartData(selectedBloodGroup)} options={chartOptions} />
                                            ) : (
                                                <div className="no-chart-data">
                                                    <p>No data available for {selectedBloodGroup}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="chart-container">
                                            {getBarChartData() ? (
                                                <Bar data={getBarChartData()} options={barChartOptions} />
                                            ) : (
                                                <div className="no-chart-data">
                                                    <p>No forecast data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Table View */}
                                {viewMode === 'table' && (
                                    <div className="table-section">
                                        <div className="table-responsive">
                                            <table className="forecast-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        {BLOOD_GROUPS.filter((bg) => forecast[bg]).map((bg) => (
                                                            <th key={bg}>{bg}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {forecast[selectedBloodGroup] &&
                                                        forecast[selectedBloodGroup].map((_, dayIdx) => (
                                                            <tr key={dayIdx}>
                                                                <td className="date-cell">
                                                                    {new Date(forecast[selectedBloodGroup][dayIdx].date).toLocaleDateString('en-US', {
                                                                        weekday: 'short',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    })}
                                                                </td>
                                                                {BLOOD_GROUPS.filter((bg) => forecast[bg]).map((bg) => {
                                                                    const dayData = forecast[bg][dayIdx];
                                                                    return (
                                                                        <td key={bg} className="forecast-cell">
                                                                            <div className="cell-content">
                                                                                <strong>{dayData.units}</strong>
                                                                                <span className="range">
                                                                                    ({dayData.lowerBound}-{dayData.upperBound})
                                                                                </span>
                                                                                <span className="confidence-mini">
                                                                                    {(dayData.confidence * 100).toFixed(0)}%
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="forecast-legend">
                                    <h3>Understanding Your Forecast</h3>
                                    <div className="legend-items">
                                        <div className="legend-item">
                                            <span className="legend-icon">📊</span>
                                            <div>
                                                <strong>Forecast Units:</strong> Expected blood demand for each day
                                            </div>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-icon">📉</span>
                                            <div>
                                                <strong>Range:</strong> Lower and upper bounds show prediction uncertainty
                                            </div>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-icon">✅</span>
                                            <div>
                                                <strong>Confidence:</strong> Model's confidence in the prediction (higher is better)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default BloodForecast;
