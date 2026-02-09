
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# ==========================================
# 1. LOAD THE MASTER DATASET
# ==========================================
print("Loading dataset...")
try:
    df = pd.read_csv("master_dataset_mumbai.csv")
    print(f"Loaded {len(df)} rows of data.")
except FileNotFoundError:
    print("Error: Could not find 'master_dataset_mumbai.csv'. Make sure it's in the same folder.")
    exit()

# ==========================================
# 2. PREPARE INPUTS AND OUTPUTS
# ==========================================
# FEATURES (X): The questions we will ask the model
# specific column names from your CSV
feature_cols = ['population', 'police_dist_km', 'is_main_road', 'crime_count', 'time_hour']
X = df[feature_cols]

# TARGET (y): The answer we want it to learn
y = df['safety_score']

# Split: 80% for training, 20% for testing (to check if it's smart)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 3. TRAIN THE MODEL
# ==========================================
print("\nTraining the Random Forest model...")
# n_estimators=100 means we create 100 "decision trees" and average them
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ==========================================
# 4. EVALUATE (HOW SMART IS IT?)
# ==========================================
predictions = model.predict(X_test)

# Calculate accuracy metrics
mae = mean_absolute_error(y_test, predictions)
accuracy = r2_score(y_test, predictions) * 100

print(f"\nModel Performance:")
print(f" -> Average Error: +/- {mae:.2f} points")
print(f" -> Accuracy Score: {accuracy:.2f}%")

# ==========================================
# 5. TEST A REAL SCENARIO
# ==========================================
print("\n--- Testing a Specific Scenario ---")
# Let's test: A dark alley (Not Main Road), 2 AM, Low Pop, Near Police
# Order: [population, police_dist_km, is_main_road, crime_count, time_hour]
test_case = [[100, 0.5, 0, 0, 2]] 
predicted_score = model.predict(test_case)[0]

print(f"Scenario: 2 AM, Alley, Low Pop, but Near Police.")
print(f"Predicted Safety Score: {predicted_score:.2f}/100")

# ==========================================
# 6. SAVE THE BRAIN
# ==========================================
joblib.dump(model, 'safety_model.pkl')
print("\nSuccess! Model saved as 'safety_model.pkl'.")