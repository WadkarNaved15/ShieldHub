import pandas as pd
from sklearn.cluster import DBSCAN
import numpy as np
from haversine import haversine

# 1. Load crime data
data = pd.read_csv("crime_data.csv")
coords = data[['latitude', 'longitude']].to_numpy()

# 2. Run DBSCAN (Haversine distance)
kms_per_radian = 6371.0088
epsilon = 0.2 / kms_per_radian  # 200 meters
db = DBSCAN(eps=epsilon, min_samples=3, algorithm='ball_tree', metric='haversine').fit(np.radians(coords))

# 3. Extract clusters
labels = db.labels_
clusters = []
for cluster_id in set(labels):
    if cluster_id == -1:  # noise
        continue
    cluster_points = coords[labels == cluster_id]
    centroid = cluster_points.mean(axis=0)

    # Compute radius = max distance from centroid
    radius = max(haversine(tuple(centroid), tuple(p)) for p in cluster_points) * 1000  # meters
    
    clusters.append({
        "latitude": centroid[0],
        "longitude": centroid[1],
        "radius": radius,
        "count": len(cluster_points)
    })

         
         
         
         return clusters
