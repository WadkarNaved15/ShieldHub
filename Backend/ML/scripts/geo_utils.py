def get_route_bounding_box(start_lat, start_lon, end_lat, end_lon, buffer_deg=0.02):
    """
    Calculates the geographical window needed for the ML model, including a safety buffer.
    """
    # Find the lowest and highest points, then apply the buffer
    min_lat = min(start_lat, end_lat) - buffer_deg
    max_lat = max(start_lat, end_lat) + buffer_deg
    
    min_lon = min(start_lon, end_lon) - buffer_deg
    max_lon = max(start_lon, end_lon) + buffer_deg
    
    # Rasterio strictly requires: Left (min_lon), Bottom (min_lat), Right (max_lon), Top (max_lat)
    return min_lon, min_lat, max_lon, max_lat