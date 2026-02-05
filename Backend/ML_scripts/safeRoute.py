# import pandas as pd
# import numpy as np
# import random
# from sklearn.model_selection import train_test_split
# from sklearn.ensemble import RandomForestRegressor
# import joblib

# # ==========================================
# # STEP 1: GENERATE SYNTHETIC DATA
# # ==========================================
# print("Generating synthetic safety data...")

# def generate_dummy_data(num_samples=5000):
#     data = []
    
#     for _ in range(num_samples):
#         # 1. Randomly pick a time (0 to 23 hours)
#         time_of_day = random.randint(0, 23)
        
#         # 2. Randomly pick population density (0 = Empty, 100 = Crowded)
#         pop_density = random.randint(0, 100)
        
#         # 3. Randomly decide if it's a Main Road (1) or Alley (0)
#         is_main_road = random.choice([0, 1])
        
#         # 4. Randomly pick distance to police (0km to 10km)
#         police_dist = round(random.uniform(0.1, 10.0), 2)

#         # --- THE "TEACHER" LOGIC ---
#         # We manually calculate a 'score' so the model has something to learn from.
#         # Start with a base score of 50 (out of 100)
#         score = 50
        
#         # Rule A: Population is safe (User suggestion!)
#         score += (pop_density * 0.4) 
        
#         # Rule B: Late night is unsafe (11 PM to 5 AM)
#         if time_of_day >= 23 or time_of_day <= 5:
#             score -= 30
        
#         # Rule C: Main roads are safer than alleys
#         if is_main_road == 1:
#             score += 10
#         else:
#             score -= 10
            
#         # Rule D: Near police is safe
#         if police_dist < 2.0:
#             score += 20
            
#         # Add some random noise so it looks like real world data
#         score += random.randint(-5, 5)
        
#         # Cap the score between 0 and 100
#         score = max(0, min(100, score))
        
#         # Add this row to our list
#         data.append([time_of_day, pop_density, is_main_road, police_dist, score])
        
#     return pd.DataFrame(data, columns=['Time', 'Population_Density', 'Is_Main_Road', 'Police_Distance', 'Safety_Score'])

# # Create the dataset
# df = generate_dummy_data()
# print(f"Created {len(df)} rows of training data.")
# print(df.head()) # Show first 5 rows

# # ==========================================
# # STEP 2: TRAIN THE MODEL
# # ==========================================
# print("\nTraining the model...")

# # Features (Inputs)
# X = df[['Time', 'Population_Density', 'Is_Main_Road', 'Police_Distance']]
# # Target (The Answer)
# y = df['Safety_Score']

# # Split data: 80% for training, 20% for testing
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # Initialize the Model (Random Forest is great for beginners)
# model = RandomForestRegressor(n_estimators=100)

# # Train the model (This is where the magic happens)
# model.fit(X_train, y_train)

# # ==========================================
# # STEP 3: TEST & SAVE
# # ==========================================

# # Let's test it with a specific scenario
# # Scenario: 2 AM, Low Population(10), Alley(0), Far from Police(5km)
# test_case = [[2, 10, 0, 5.0]] 
# prediction = model.predict(test_case)

# print(f"\nTest Prediction for a Dangerous Road (2 AM, Alley): {prediction[0]:.2f}/100")

# # Save the model to a file
# joblib.dump(model, 'safety_model.pkl')
# print("\nModel saved as 'safety_model.pkl'. You can now use this in your app!")








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