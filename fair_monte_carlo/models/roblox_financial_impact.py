# fair_monte_carlo/models/roblox_financial_impact.py
import numpy as np

class RobloxFinancialImpact:
    """
    Handles specialized secondary loss calculations for Roblox 2026.
    Calculates impact based on demographically-targeted monetization and 
    seasonality variables.
    """
    def __init__(self, daus, abpdau, month, cohort="18-34", gender="mixed"):
        self.daus = daus               # Daily Active Users (Input from UI)
        self.abpdau = abpdau           # Avg Bookings Per DAU (Input from UI)
        self.month = int(month)
        self.cohort = cohort
        self.gender = gender

    def get_seasonality_multiplier(self):
        """
        Seasonality based on Roblox Q4 2025 performance data.
        June and December represent peak transaction periods.
        """
        # Surge multiplier for peak months
        if self.month in [6, 12]:
            return 1.45  
        return 1.00

    def calculate_secondary_churn_loss(self, primary_loss_event):
        """
        Calculates the 'Value at Risk' from churn.
        Uses the 28-month revenue recognition cycle to estimate LTV loss.
        """
        seasonality = self.get_seasonality_multiplier()
        
        # Demographic Churn Multipliers (Parental Veto Logic)
        churn_rate = 0.15 # Baseline (Male/Generic)
        if self.cohort == "U13" and self.gender == "female":
            churn_rate = 0.35 # High-impact "Safety Churn"
        elif self.cohort == "18-34":
            churn_rate = 0.10 # Higher stickiness, but higher $ loss per user
            
        # Total Bookings at Risk = (DAU * ABPDAU) * Churn Rate * Seasonality
        # We model 1 quarter (90 days) of immediate booking impact
        bookings_at_risk = (self.daus * self.abpdau) * churn_rate * seasonality
        
        return round(bookings_at_risk, 2)