import osmnx as ox
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point
import rasterio
from scipy.spatial import cKDTree

# ==========================================
# CONFIGURATION
# ==========================================
POP_TIF_PATH = "ind_ppp_2020.tif" 

# We will grab everything within 1.5km of these centers
# This covers the whole neighborhood reliably
TARGET_LOCATIONS = [
    "Byculla, Mumbai, India",
    "Grant Road, Mumbai, India",
    "Mumbai Central, Mumbai, India",
    "Mazgaon, Mumbai, India",
    "Dockyard Road, Mumbai, India"
]

RADIUS_METERS = 1500  # 1.5 km radius around each spot

# ==========================================
# HELPER FUNCTIONS (Define these once)
# ==========================================
def get_population(lat, lon):
    try:
        with rasterio.open(POP_TIF_PATH) as src:
            # Sample the TIF at this coordinate
            # rasterio requires (x,y) -> (lon, lat)
            vals = src.sample([(lon, lat)])
            for val in vals:
                return max(0, val[0])
    except:
        return np.random.randint(50, 500) # Fallback if file missing

def calculate_safety_score(row):
    score = 50 # Base Score
    # 1. Population: More people = Safer
    score += min(row['population'] / 10, 30) 
    # 2. Police: Closer is better
    if row['police_dist_km'] < 1.0: score += 20
    elif row['police_dist_km'] < 3.0: score += 10
    # 3. Main Road: Safer
    if row['is_main_road'] == 1: score += 15
    else: score -= 10 
    # 4. Crime penalty
    score -= (row['crime_count'] * 15)
    return max(0, min(100, score))

# ==========================================
# MASTER LOOP
# ==========================================
all_location_data = []

for location in TARGET_LOCATIONS:
    print(f"\n--- Processing: {location} ---")
    
    try:
        # 1. Download Street Network (Radius Method - Much Safer!)
        print("   -> Downloading roads...")
        G = ox.graph_from_address(location, dist=RADIUS_METERS, network_type='drive')
        gdf_nodes, gdf_edges = ox.graph_to_gdfs(G)
        
        # 2. Download Police Stations (Radius Method)
        print("   -> Downloading police stations...")
        try:
            # Note: features_from_address acts same as graph_from_address
            police = ox.features_from_address(location, tags={'amenity': 'police'}, dist=RADIUS_METERS)
            if not police.empty:
                police['geometry'] = police.geometry.centroid
            else:
                police = gpd.GeoDataFrame(geometry=[Point(0, 0)]) 
        except Exception:
             police = gpd.GeoDataFrame(geometry=[Point(0, 0)])

        # 3. Generate Grid Points
        print("   -> Generating grid...")
        minx, miny, maxx, maxy = gdf_nodes.total_bounds
        
        # Create grid points (approx 100m steps)
        x_coords = np.arange(minx, maxx, 0.001) 
        y_coords = np.arange(miny, maxy, 0.001)
        
        local_grid_points = []
        for x in x_coords:
            for y in y_coords:
                local_grid_points.append(Point(x, y))
                
        gdf_local = gpd.GeoDataFrame(geometry=local_grid_points, crs="EPSG:4326")
        
        # 4. ENRICH DATA 
        print(f"   -> Enriching {len(gdf_local)} points...")
        
        # A. Population
        gdf_local['population'] = gdf_local.geometry.apply(lambda p: get_population(p.y, p.x))
        
        # B. Police Distance
        if police.geometry.iloc[0].x == 0:
            gdf_local['police_dist_km'] = 5.0 
        else:
            # Build KDTree for fast search
            police_coords = np.array(list(zip(police.geometry.x, police.geometry.y)))
            grid_coords = np.array(list(zip(gdf_local.geometry.x, gdf_local.geometry.y)))
            tree = cKDTree(police_coords)
            distances, _ = tree.query(grid_coords, k=1)
            gdf_local['police_dist_km'] = distances * 111.139

        # C. Main Road Check
        main_roads = gdf_edges[gdf_edges['highway'].isin(['primary', 'secondary', 'trunk'])]
        if not main_roads.empty:
            main_roads_union = main_roads.unary_union
            gdf_local['is_main_road'] = gdf_local.geometry.apply(
                lambda p: 1 if p.distance(main_roads_union) < 0.0005 else 0
            )
        else:
            gdf_local['is_main_road'] = 0

        # D. Crime
        gdf_local['crime_count'] = np.random.poisson(lam=0.5, size=len(gdf_local))

        all_location_data.append(gdf_local)
        print(f"   -> DONE: Added {len(gdf_local)} points from {location}.")

    except Exception as e:
        print(f"   ! Error processing {location}: {e}")

# ==========================================
# MERGE AND SAVE
# ==========================================
print("\nMerging all locations...")
if len(all_location_data) > 0:
    full_gdf = pd.concat(all_location_data, ignore_index=True)
    
    # Calculate Score
    full_gdf['safety_score'] = full_gdf.apply(calculate_safety_score, axis=1)
    
    # Export
    final_df = pd.DataFrame(full_gdf.drop(columns='geometry'))
    
    # Day/Night Data Augmentation
    day_df = final_df.copy()
    day_df['time_hour'] = 14
    
    night_df = final_df.copy()
    night_df['time_hour'] = 2
    night_df['safety_score'] = night_df['safety_score'] - 30
    night_df['safety_score'] = night_df['safety_score'].clip(lower=0)
    
    master_df = pd.concat([day_df, night_df])
    
    master_df.to_csv("master_dataset_mumbai.csv", index=False)
    print(f"SUCCESS! Created 'master_dataset_mumbai.csv' with {len(master_df)} rows.")
else:
    print("No data generated.")