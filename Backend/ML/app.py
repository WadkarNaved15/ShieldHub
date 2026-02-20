# import os
# os.environ["OMP_NUM_THREADS"] = "1"
# os.environ["OPENBLAS_NUM_THREADS"] = "1"
# os.environ["MKL_NUM_THREADS"] = "1"
# os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
# os.environ["NUMEXPR_NUM_THREADS"] = "1"
# from flask import Flask, request, jsonify
# import pandas as pd
# import numpy as np
# import joblib
# import rasterio
# import osmnx as ox
# from shapely.geometry import Point
# from scipy.spatial import cKDTree
# import boto3
# from rasterio.session import AWSSession
# from rasterio.windows import from_bounds
# from scripts.geo_utils import get_route_bounding_box

# app = Flask(__name__)


# print("--- STARTING SAFETY ENGINE ---")

# # 1. Create an AWS Session using the credentials from your .env file
# aws_session = AWSSession(boto3.Session(
#     aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
#     aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
#     region_name=os.getenv('AWS_DEFAULT_REGION')
# ))

# # A. Load the ML Model
# print("1. Loading Model...")
# model = joblib.load('safety_model.pkl')

# # B. Load Population Map
# print("2. Loading Population Map...")
# POP_TIF_PATH = "ind_ppp_2020.tif" 
# pop_dataset = rasterio.open(POP_TIF_PATH)

# # ==========================================
# # REPLACE SECTION 3 (Caching Police Stations)
# # ==========================================
# print("3. Caching Police Stations (20km Radius)...")
# LOCATION_ADDRESS = "Mumbai, India" 
# try:
#     # Use features_from_address with a 20km radius (covers most of the city)
#     # This is much safer than searching for a "Place" polygon
#     police_gdf = ox.features_from_address(LOCATION_ADDRESS, tags={'amenity': 'police'}, dist=20000)
    
#     police_gdf['geometry'] = police_gdf.geometry.centroid
#     police_coords = np.array(list(zip(police_gdf.geometry.x, police_gdf.geometry.y)))
#     police_tree = cKDTree(police_coords)
#     print(f"   -> Success! Cached {len(police_gdf)} police stations.")
# except Exception as e:
#     print(f"   ! Warning: Still failed to download police data ({e}). Using dummy data.")
#     police_tree = None

# # ==========================================
# # 2. HELPER FUNCTIONS
# # ==========================================
# def get_features_from_coords(lat, lon, time_hour):
#     # 1. Get Population
#     try:
#         row, col = pop_dataset.index(lon, lat)
#         val = pop_dataset.read(1, window=rasterio.windows.Window(col, row, 1, 1))[0][0]
#         population = max(0, val)
#     except:
#         population = 50 # Default
        
#     # 2. Get Police Distance
#     if police_tree:
#         # Query the tree (returns distance in degrees)
#         dist_deg, _ = police_tree.query([[lon, lat]], k=1)
#         police_dist_km = dist_deg[0] * 111.139
#     else:
#         police_dist_km = 5.0 # Default

#     # 3. Check Main Road (Simplified for API speed: assuming we trust the routing engine)
#     # For now, we default to 1 (Assuming app routes on roads). 
#     # To be accurate, we'd need to query OSM here, but it's slow.
#     is_main_road = 1 
    
#     # 4. Crime Count (Simulated for now, replace with DB query later)
#     crime_count = 0 
    
#     return [population, police_dist_km, is_main_road, crime_count, time_hour]

# # ==========================================
# # 3. THE API ENDPOINT
# # ==========================================
# # ==========================================
# # 3. API ENDPOINT (FIXED)
# # ==========================================
# @app.route('/predict_safety', methods=['POST'])
# def predict_safety():
#     try:
#         data = request.json
#         lat = float(data.get('latitude'))
#         lon = float(data.get('longitude'))
#         time_hour = int(data.get('time_hour', 12))
        
#         # Get features
#         features = get_features_from_coords(lat, lon, time_hour)
        
#         # Prepare for model
#         feature_df = pd.DataFrame([features], columns=['population', 'police_dist_km', 'is_main_road', 'crime_count', 'time_hour'])
        
#         # Predict
#         score = model.predict(feature_df)[0]
        
#         # --- THE FIX IS HERE ---
#         # We explicitly convert (cast) numpy numbers to standard Python floats
#         return jsonify({
#             'success': True,
#             'safety_score': round(float(score), 1),  # Converted to float
#             'meta': {
#                 'pop': round(float(features[0]), 0), # Converted to float
#                 'police_km': round(float(features[1]), 2) # Converted to float
#             }
#         })

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({'success': False, 'error': str(e)})

# if __name__ == '__main__':
#     print("--- READY TO SERVE REQUESTS ---")
#     app.run(port=5001, debug=False,threaded=False)








import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
import rasterio
import osmnx as ox
from shapely.geometry import Point
from scipy.spatial import cKDTree
import boto3
from rasterio.session import AWSSession
from rasterio.windows import Window

app = Flask(__name__)

print("--- STARTING SAFETY ENGINE ---")

# 1. Create the AWS Session globally so it is ready for incoming requests
aws_session = AWSSession(boto3.Session(
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_DEFAULT_REGION')
))

# Your new S3 URI goes here!
S3_POP_TIF_PATH = "s3://hershield-population-density/ind_ppp_2020.tif"

# A. Load the ML Model from the local AWS hard drive
print("1. Loading Model...")
model = joblib.load('safety_model.pkl')

# ==========================================
# Caching Police Stations (20km Radius)
# ==========================================
print("2. Caching Police Stations (20km Radius)...")
LOCATION_ADDRESS = "Mumbai, India" 
try:
    police_gdf = ox.features_from_address(LOCATION_ADDRESS, tags={'amenity': 'police'}, dist=20000)
    police_gdf['geometry'] = police_gdf.geometry.centroid
    police_coords = np.array(list(zip(police_gdf.geometry.x, police_gdf.geometry.y)))
    police_tree = cKDTree(police_coords)
    print(f"   -> Success! Cached {len(police_gdf)} police stations.")
except Exception as e:
    print(f"   ! Warning: Still failed to download police data ({e}). Using dummy data.")
    police_tree = None

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def get_features_from_coords(lat, lon, time_hour):
    # 1. Get Population via S3 Streaming
    try:
        # We open the S3 connection specifically for this coordinate
        with rasterio.Env(aws_session):
            with rasterio.open(S3_POP_TIF_PATH) as pop_dataset:
                row, col = pop_dataset.index(lon, lat)
                # Stream exactly 1 pixel from the cloud
                val = pop_dataset.read(1, window=Window(col, row, 1, 1))[0][0]
                population = max(0, float(val))
    except Exception as e:
        print(f"S3 Population fetch error: {e}")
        population = 50 # Default fallback
        
    # 2. Get Police Distance
    if police_tree:
        dist_deg, _ = police_tree.query([[lon, lat]], k=1)
        police_dist_km = dist_deg[0] * 111.139
    else:
        police_dist_km = 5.0 

    # 3. Check Main Road 
    is_main_road = 1 
    
    # 4. Crime Count 
    crime_count = 0 
    
    return [population, police_dist_km, is_main_road, crime_count, time_hour]

# ==========================================
# API ENDPOINT
# ==========================================
@app.route('/predict_safety', methods=['POST'])
def predict_safety():
    try:
        data = request.json
        lat = float(data.get('latitude'))
        lon = float(data.get('longitude'))
        time_hour = int(data.get('time_hour', 12))
        
        # Get features
        features = get_features_from_coords(lat, lon, time_hour)
        
        # Prepare for model
        feature_df = pd.DataFrame([features], columns=['population', 'police_dist_km', 'is_main_road', 'crime_count', 'time_hour'])
        
        # Predict
        score = model.predict(feature_df)[0]
        
        return jsonify({
            'success': True,
            'safety_score': round(float(score), 1),
            'meta': {
                'pop': round(float(features[0]), 0),
                'police_km': round(float(features[1]), 2)
            }
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    print("--- READY TO SERVE REQUESTS ---")
    app.run(port=5001, debug=False, threaded=False)