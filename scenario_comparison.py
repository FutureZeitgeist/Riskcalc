from fair_monte_carlo import RiskScenario, MonteCarloSimulation

# Before implementing a control
baseline = (RiskScenario("Without MFA")
    .with_tef(10)
    .with_vulnerability(0.5)
    .with_primary_loss(100_000)
    .build())

# After implementing MFA
with_mfa = (RiskScenario("With MFA")
    .with_tef(10)
    .with_vulnerability(0.1)  # Reduced vulnerability
    .with_primary_loss(100_000)
    .build())

sim = MonteCarloSimulation(iterations=10_000)
comparison = sim.run_comparison(baseline, with_mfa)

print(f"Risk Reduction: ${comparison['risk_reduction']['mean']:,.0f}")