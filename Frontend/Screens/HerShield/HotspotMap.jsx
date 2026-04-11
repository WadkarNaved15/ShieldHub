
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform, Alert, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { LocationContext } from '../../Context/Location'; // Using your provided context

// A modern, dark map style for Google Maps.
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const API_URL = 'http://192.168.43.224:3000/hotspots/get'; 

const HotspotMap = () => {
  const [region, setRegion] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  // --- CONTEXT INTEGRATION ---
  // Consume the location directly from your context
  const { location } = useContext(LocationContext);

  // Effect for fetching hotspot data (runs once)
  useEffect(() => {
    const fetchHotspotData = async () => {
        try {
            // Using mock data for fallback/demonstration. 
            // Replace with your real API call when ready.
            const mockData = [
                { "latitude": 18.97154327299547, "longitude": 72.83184801009317, "severity": 2, "radius": 50 },
                { "latitude": 18.969705348365654,  "longitude": 72.81935263945134, "severity": 3, "radius": 150 },
                { "latitude": 18.96495950544644,  "longitude": 72.82614399337463, "severity": 5, "radius": 100 },
                { "latitude": 18.959751637819263,  "longitude": 72.83781122665454, "severity": 3, "radius": 120 },
                { "latitude": 18.965113611116564,   "longitude": 2.82745596776529, "severity": 1, "radius": 120 },
            ];
            
            const validHotspots = mockData.filter(
              (spot) =>
                spot && typeof spot.latitude === 'number' && typeof spot.longitude === 'number'
            );
            setHotspots(validHotspots);
        } catch (error) {
            console.error('Failed to fetch hotspots:', error);
            Alert.alert("API Error", "Could not fetch crime hotspot data.");
        }
    };

    fetchHotspotData();
  }, []);

  // Effect for handling location updates from the context
  useEffect(() => {
    if (location) {
      // If we get a location from the context, set the map region
      const currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(currentLocation);
      setIsLoading(false); // Stop loading now that we have a region
    } else {
      // If location is null, the context is either still fetching or has failed.
      // We can set a timeout to stop loading and show a default map.
      const timer = setTimeout(() => {
        if (isLoading) { // Check if we are still in a loading state
          console.log("Location context timed out, using default location.");
          const defaultLocation = { latitude: 19.4286, longitude: 72.8196, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
          setRegion(defaultLocation);
          setIsLoading(false);
        }
      }, 10000); // Wait 10 seconds before falling back

      return () => clearTimeout(timer); // Cleanup timer on unmount or if location arrives
    }
  }, [location]); // This effect re-runs whenever the location object from the context changes

  const recenterMap = () => {
    // Use the location from the context to recenter
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
      }, 1000);
    } else {
        Alert.alert("Location not available", "Cannot recenter without your current location.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Analyzing safety data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
      >
        {hotspots.map((spot, index) => {
          let circleColor = 'rgba(255, 255, 0, 0.3)'; // Default: Yellow
          if (spot.severity > 3) {
            circleColor = 'rgba(255, 0, 0, 0.3)'; // Red
          } else if (spot.severity === 3) {
            circleColor = 'rgba(255, 165, 0, 0.3)'; // Orange
          }
          
          return (
            <Circle
              key={index}
              center={{ latitude: spot.latitude, longitude: spot.longitude }}
              radius={spot.radius || 50}
              fillColor={circleColor}
              strokeWidth={1}
              strokeColor={circleColor.replace('0.3', '0.5')}
            />
          );
        })}
      </MapView>
      
      <View style={styles.overlayContainer}>
         <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Safety Zones</Text>
            <Text style={styles.infoText}>The colored circles represent zones with reported incidents, colored by severity.</Text>
            <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, {backgroundColor: 'rgba(255, 0, 0, 0.5)'}]} />
                <Text style={styles.legendText}>High Severity</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, {backgroundColor: 'rgba(255, 165, 0, 0.5)'}]} />
                <Text style={styles.legendText}>Medium Severity</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, {backgroundColor: 'rgba(255, 255, 0, 0.5)'}]} />
                <Text style={styles.legendText}>Low Severity</Text>
            </View>
         </View>
         <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
            <Text style={styles.recenterButtonText}>🎯</Text> 
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#242f3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(40, 50, 60, 0.9)',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    elevation: 5,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 10, 
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  legendIndicator: {
      width: 18,
      height: 18,
      borderRadius: 9,
      marginRight: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  legendText: {
    color: '#E0E0E0',
    fontSize: 14, 
    fontWeight: '500',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 180, 
    right: 0,
    backgroundColor: 'rgba(40, 50, 60, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  recenterButtonText: {
    fontSize: 24,
  },
});

export default HotspotMap;





