// Open FAIR Monte Carlo Calculator - Frontend JavaScript

let histogramChart = null;
let exceedanceChart = null;
let currentScenarioId = null;
let lastSimulationData = null;

// Format currency
function formatCurrency(value) {
    if (value === undefined || value === null) return '$0';
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

// Format date for display
function formatDate(isoString) {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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

// Toggle analysis mode (ALE vs SLE)
function toggleAnalysisMode() {
    const mode = document.querySelector('input[name="analysis-mode"]:checked').value;
    const lefSection = document.querySelector('.taxonomy-section:first-of-type');
    const helpText = document.getElementById('analysis-mode-help');

    if (mode === 'sle') {
        lefSection.classList.add('section-disabled');
        helpText.textContent = 'SLE \u2014 loss distribution for a single event (LEF not used)';
    } else {
        lefSection.classList.remove('section-disabled');
        helpText.textContent = 'ALE = LEF \u00d7 LM \u2014 expected annual loss across all events';
    }
}

// Toggle secondary loss inputs
function toggleSecondaryLoss() {
    const include = document.getElementById('include-secondary').checked;
    document.getElementById('secondary-loss-inputs').style.display = include ? 'block' : 'none';
}

// Collect LEF configuration for saving
function collectLEFConfig() {
    const analysisMode = document.querySelector('input[name="analysis-mode"]:checked').value;