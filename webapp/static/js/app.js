// Open FAIR Monte Carlo Calculator - Frontend JavaScript

let histogramChart = null;
let exceedanceChart = null;

// Format currency
function formatCurrency(value) {
    if (value >= 1000000000) {
        return '$' + (value / 1000000000).toFixed(2) + 'B';
    } else if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    } else {
        return '$' + value.toFixed(0);
    }
}

// Format number with commas
function formatNumber(value, decimals = 2) {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Toggle distribution input fields
function toggleDistribution(prefix) {
    const typeSelect = document.getElementById(`${prefix}-type`);
    if (!typeSelect) return;

    const type = typeSelect.value;

    // Hide all distribution inputs for this prefix
    const allInputs = document.querySelectorAll(`[id^="${prefix}-"][class="distribution-inputs"]`);
    allInputs.forEach(el => el.style.display = 'none');

    // Show the selected distribution inputs
    const selectedInput = document.getElementById(`${prefix}-${type}`);
    if (selectedInput) {
        selectedInput.style.display = 'block';
    }
}

// Toggle LEF mode (direct vs derived)
function toggleLEFMode() {
    const mode = document.querySelector('input[name="lef-mode"]:checked').value;
    document.getElementById('lef-direct').style.display = mode === 'direct' ? 'block' : 'none';
    document.getElementById('lef-derived').style.display = mode === 'derived' ? 'block' : 'none';
}

// Toggle TEF mode (direct vs derived from CF+PoA)
function toggleTEFMode() {
    const mode = document.querySelector('input[name="tef-mode"]:checked').value;
    document.getElementById('tef-direct').style.display = mode === 'direct' ? 'block' : 'none';
    document.getElementById('tef-derived').style.display = mode === 'derived' ? 'block' : 'none';
}

// Toggle Vulnerability mode (direct vs derived from TCap+RS)
function toggleVulnMode() {
    const mode = document.querySelector('input[name="vuln-mode"]:checked').value;
    document.getElementById('vuln-direct').style.display = mode === 'direct' ? 'block' : 'none';
    document.getElementById('vuln-derived').style.display = mode === 'derived' ? 'block' : 'none';
}

// Toggle LM mode (direct vs derived)
function toggleLMMode() {
    const mode = document.querySelector('input[name="lm-mode"]:checked').value;
    document.getElementById('lm-direct').style.display = mode === 'direct' ? 'block' : 'none';
    document.getElementById('lm-derived').style.display = mode === 'derived' ? 'block' : 'none';
}

// Toggle secondary loss inputs
function toggleSecondaryLoss() {
    const include = document.getElementById('include-secondary').checked;
    document.getElementById('secondary-loss-inputs').style.display = include ? 'block' : 'none';
}

// Collect form data
function collectFormData() {
    const data = {
        name: document.getElementById('scenario-name').value,
        iterations: parseInt(document.getElementById('iterations').value),
    };

    // LEF Mode
    const lefMode = document.querySelector('input[name="lef-mode"]:checked').value;

    if (lefMode === 'direct') {
        // Direct LEF input
        const lefType = document.getElementById('lef-type').value;
        if (lefType === 'triangular') {
            data.lef = {
                type: 'triangular',
                min: parseFloat(document.getElementById('lef-min').value),
                likely: parseFloat(document.getElementById('lef-likely').value),
                max: parseFloat(document.getElementById('lef-max').value)
            };
        } else if (lefType === 'pert') {
            data.lef = {
                type: 'pert',
                min: parseFloat(document.getElementById('lef-pert-min').value),
                likely: parseFloat(document.getElementById('lef-pert-likely').value),
                max: parseFloat(document.getElementById('lef-pert-max').value)
            };
        } else {
            data.lef = {
                type: 'constant',
                value: parseFloat(document.getElementById('lef-value').value)
            };
        }
    } else {
        // Derived LEF from TEF and Vulnerability

        // TEF
        const tefMode = document.querySelector('input[name="tef-mode"]:checked').value;
        if (tefMode === 'direct') {
            const tefType = document.getElementById('tef-type').value;
            if (tefType === 'triangular') {
                data.tef = {
                    type: 'triangular',
                    min: parseFloat(document.getElementById('tef-min').value),
                    likely: parseFloat(document.getElementById('tef-likely').value),
                    max: parseFloat(document.getElementById('tef-max').value)
                };
            } else if (tefType === 'pert') {
                data.tef = {
                    type: 'pert',
                    min: parseFloat(document.getElementById('tef-pert-min').value),
                    likely: parseFloat(document.getElementById('tef-pert-likely').value),
                    max: parseFloat(document.getElementById('tef-pert-max').value)
                };
            } else {
                data.tef = {
                    type: 'constant',
                    value: parseFloat(document.getElementById('tef-value').value)
                };
            }
        } else {
            // Derived TEF from CF and PoA
            data.contact_frequency = {
                type: 'triangular',
                min: parseFloat(document.getElementById('cf-min').value),
                likely: parseFloat(document.getElementById('cf-likely').value),
                max: parseFloat(document.getElementById('cf-max').value)
            };
            data.probability_of_action = {
                type: 'triangular',
                min: parseFloat(document.getElementById('poa-min').value),
                likely: parseFloat(document.getElementById('poa-likely').value),
                max: parseFloat(document.getElementById('poa-max').value)
            };
        }

        // Vulnerability
        const vulnMode = document.querySelector('input[name="vuln-mode"]:checked').value;
        if (vulnMode === 'direct') {
            const vulnType = document.getElementById('vuln-type').value;
            if (vulnType === 'triangular') {
                data.vulnerability = {
                    type: 'triangular',
                    min: parseFloat(document.getElementById('vuln-min').value),
                    likely: parseFloat(document.getElementById('vuln-likely').value),
                    max: parseFloat(document.getElementById('vuln-max').value)
                };
            } else if (vulnType === 'pert') {
                data.vulnerability = {
                    type: 'pert',
                    min: parseFloat(document.getElementById('vuln-pert-min').value),
                    likely: parseFloat(document.getElementById('vuln-pert-likely').value),
                    max: parseFloat(document.getElementById('vuln-pert-max').value)
                };
            } else {
                data.vulnerability = {
                    type: 'constant',
                    value: parseFloat(document.getElementById('vuln-value').value)
                };
            }
        } else {
            // Derived Vulnerability from TCap and RS (21x21 grid)
            data.threat_capability = {
                type: 'triangular',
                min: parseFloat(document.getElementById('tcap-min').value) / 100,
                likely: parseFloat(document.getElementById('tcap-likely').value) / 100,
                max: parseFloat(document.getElementById('tcap-max').value) / 100
            };
            data.resistance_strength = {
                type: 'triangular',
                min: parseFloat(document.getElementById('rs-min').value) / 100,
                likely: parseFloat(document.getElementById('rs-likely').value) / 100,
                max: parseFloat(document.getElementById('rs-max').value) / 100
            };
        }
    }

    // Loss Magnitude Mode
    const lmMode = document.querySelector('input[name="lm-mode"]:checked').value;

    if (lmMode === 'direct') {
        // Direct LM input
        const lossType = document.getElementById('loss-type').value;
        if (lossType === 'lognormal') {
            data.loss = {
                type: 'lognormal',
                low: parseFloat(document.getElementById('loss-low').value),
                high: parseFloat(document.getElementById('loss-high').value)
            };
        } else if (lossType === 'pert') {
            data.loss = {
                type: 'pert',
                min: parseFloat(document.getElementById('loss-min').value),
                likely: parseFloat(document.getElementById('loss-likely').value),
                max: parseFloat(document.getElementById('loss-max').value)
            };
        } else {
            data.loss = {
                type: 'constant',
                value: parseFloat(document.getElementById('loss-value').value)
            };
        }
    } else {
        // Derived LM from Primary + Secondary Loss
        const plType = document.getElementById('pl-type').value;
        if (plType === 'lognormal') {
            data.primary_loss = {
                type: 'lognormal',
                low: parseFloat(document.getElementById('pl-low').value),
                high: parseFloat(document.getElementById('pl-high').value)
            };
        } else if (plType === 'pert') {
            data.primary_loss = {
                type: 'pert',
                min: parseFloat(document.getElementById('pl-min').value),
                likely: parseFloat(document.getElementById('pl-likely').value),
                max: parseFloat(document.getElementById('pl-max').value)
            };
        } else {
            data.primary_loss = {
                type: 'constant',
                value: parseFloat(document.getElementById('pl-value').value)
            };
        }

        // Secondary loss (optional)
        if (document.getElementById('include-secondary').checked) {
            data.secondary_loss_frequency = {
                type: 'triangular',
                min: parseFloat(document.getElementById('slef-min').value),
                likely: parseFloat(document.getElementById('slef-likely').value),
                max: parseFloat(document.getElementById('slef-max').value)
            };
            data.secondary_loss_magnitude = {
                type: 'lognormal',
                low: parseFloat(document.getElementById('slm-low').value),
                high: parseFloat(document.getElementById('slm-high').value)
            };
        }
    }

    return data;
}

// Display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';

    // Summary stats
    document.getElementById('result-mean').textContent = formatCurrency(data.summary.mean);
    document.getElementById('result-median').textContent = formatCurrency(data.summary.median);
    document.getElementById('result-var').textContent = formatCurrency(data.summary.var_95);
    document.getElementById('result-cvar').textContent = formatCurrency(data.summary.cvar_95);

    // Percentiles
    document.getElementById('result-p10').textContent = formatCurrency(data.summary.p10);
    document.getElementById('result-p25').textContent = formatCurrency(data.summary.p25);
    document.getElementById('result-p75').textContent = formatCurrency(data.summary.p75);
    document.getElementById('result-p90').textContent = formatCurrency(data.summary.p90);
    document.getElementById('result-p95').textContent = formatCurrency(data.summary.p95);

    // Components
    document.getElementById('result-lef').textContent = formatNumber(data.lef.mean) + ' events/year';
    document.getElementById('result-lm').textContent = formatCurrency(data.lm.mean);
    document.getElementById('result-min').textContent = formatCurrency(data.summary.min);
    document.getElementById('result-max').textContent = formatCurrency(data.summary.max);
    document.getElementById('result-std').textContent = formatCurrency(data.summary.std);

    // Show calculated vulnerability if derived from TCap/RS
    const vulnResultDiv = document.getElementById('vuln-result');
    if (data.calculated_vulnerability !== undefined) {
        vulnResultDiv.style.display = 'block';
        document.getElementById('calc-vuln').textContent = (data.calculated_vulnerability * 100).toFixed(1) + '%';
    } else {
        vulnResultDiv.style.display = 'none';
    }

    // Update charts
    updateHistogramChart(data.histogram);
    updateExceedanceChart(data.exceedance);

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Create/update histogram chart
function updateHistogramChart(histogramData) {
    const ctx = document.getElementById('histogram-chart').getContext('2d');

    // Calculate bin centers for x-axis labels
    const binCenters = [];
    for (let i = 0; i < histogramData.bins.length - 1; i++) {
        binCenters.push((histogramData.bins[i] + histogramData.bins[i + 1]) / 2);
    }

    if (histogramChart) {
        histogramChart.destroy();
    }

    histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binCenters.map(v => formatCurrency(v)),
            datasets: [{
                label: 'Frequency',
                data: histogramData.counts,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const idx = context[0].dataIndex;
                            const low = histogramData.bins[idx];
                            const high = histogramData.bins[idx + 1];
                            return formatCurrency(low) + ' - ' + formatCurrency(high);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Annual Loss ($)'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 45
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    });
}

// Create/update exceedance curve chart
function updateExceedanceChart(exceedanceData) {
    const ctx = document.getElementById('exceedance-chart').getContext('2d');

    if (exceedanceChart) {
        exceedanceChart.destroy();
    }

    exceedanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: exceedanceData.values.map(v => formatCurrency(v)),
            datasets: [{
                label: 'Probability of Exceedance',
                data: exceedanceData.probabilities,
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + '% chance of exceeding this loss';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Loss Amount ($)'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 45
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Probability (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Run simulation
async function runSimulation(event) {
    event.preventDefault();

    const btn = document.getElementById('run-btn');
    btn.disabled = true;
    btn.textContent = 'Running Simulation...';
    btn.classList.add('loading');

    try {
        const formData = collectFormData();

        const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            displayResults(data);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error running simulation: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Run Simulation';
        btn.classList.remove('loading');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set up form submission
    document.getElementById('risk-form').addEventListener('submit', runSimulation);

    // Initialize distribution toggles
    toggleDistribution('lef');
    toggleDistribution('tef');
    toggleDistribution('vuln');
    toggleDistribution('loss');
    toggleDistribution('pl');

    // Initialize mode toggles
    toggleLEFMode();
    toggleTEFMode();
    toggleVulnMode();
    toggleLMMode();
    toggleSecondaryLoss();
});
