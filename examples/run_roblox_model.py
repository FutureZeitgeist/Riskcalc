from fair_monte_carlo import (
    RiskScenario, 
    PERTDistribution, 
    MonteCarloSimulation, 
    RiskReport
)

# Building the scenario
model = (RiskScenario("Roblox Infrastructure Ransomware")
    .with_tef(PERTDistribution(1, 3, 10))
    .with_vulnerability(0.25)
    .with_primary_loss(PERTDistribution(50000, 200000, 1000000))
    .build())

# Initialize the engine and run
# We create an instance of the class, then call the 'run' method
sim = MonteCarloSimulation(iterations=10000)
results = sim.run(model)

# Generate and print the summary
RiskReport(results).print_summary()