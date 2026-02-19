
import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator, 
  Keyboard, 
  Alert,
  Linking,
  Platform,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Geocoder from 'react-native-geocoding';
import { LocationContext } from '../Context/Location';

// ⚠️ Ensure your API Key is set here
Geocoder.init(process.env.GOOGLE_MAPS_API_KEY || '');  

const { width, height } = Dimensions.get('window');

// ==================================================
// 1. HELPER: DECODE POLYLINE
// ==================================================
const decodePolyline = (encoded) => {
  if (!encoded) return [];
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return poly;
};

// ==================================================
// 2. MAIN COMPONENT
// ==================================================
const SafeRouteScreen = () => {
  const mapRef = useRef(null);
  const navigation = useNavigation();

  // --- CONSUME CONTEXT ---
  const { location, fetchLocation } = useContext(LocationContext);

  // --- STATE ---
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // --- REUSABLE FUNCTION: REVERSE GEOCODE ---
  const fillAddressFromCoordinates = async (lat, lng) => {
    console.log("Filling address for coords:", lat, lng);
    setAddressLoading(true);
    try {
      // 1. Zoom Map to location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
      }

      // 2. Convert to Address Name
      const json = await Geocoder.from(lat, lng);
      if (json.results.length > 0) {
        const addressComponent = json.results[0].formatted_address;
        setOrigin(addressComponent);
      } else {
        setOrigin(`${lat}, ${lng}`);
      }
    } catch (error) {
      console.warn("Geocoding Error:", error);
      // Fallback to coordinates if geocoding fails
      setOrigin(`${lat}, ${lng}`);
    } finally {
      setAddressLoading(false);
    }
  };

  // --- EFFECT: ON LOAD (Automatic) ---
  useEffect(() => {
    if (location) {
      fillAddressFromCoordinates(location.latitude, location.longitude);
    }
  }, [location]);

  // --- BUTTON HANDLER: MANUAL CLICK (Force Update) ---
  const handleGetCurrentLocation = async () => {
    setAddressLoading(true);
    
    // 1. Refresh GPS Data
    await fetchLocation(); 

    // 2. Force input update using the LATEST location from context (or existing)
    // Even if fetchLocation returns the same coords, we want to refill the text box.
    if (location) {
        fillAddressFromCoordinates(location.latitude, location.longitude);
    } else {
        // If context is still null for some reason (rare), stop loading
        setAddressLoading(false);
    }
  };

  // --- API CALL: FETCH ROUTES ---
  const fetchSafeRoutes = async () => {
    if (!origin || !destination) {
      Alert.alert("Input Error", "Please enter both Start and Destination.");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setRoutes([]); 

    try {
      const API_URL = `${process.env.BACKEND_URI}/safeRoute`; 
      const response = await axios.post(API_URL, { origin, destination });

      if (response.data.success && response.data.routes.length > 0) {
        const fetchedRoutes = response.data.routes.map(route => ({
            ...route,
            coordinates: decodePolyline(route.polyline) 
        }));
        setRoutes(fetchedRoutes);
        setSelectedRouteIndex(0);

        if (fetchedRoutes[0].coordinates.length > 0) {
          setTimeout(() => {
            if (mapRef.current) { 
              mapRef.current.fitToCoordinates(fetchedRoutes[0].coordinates, {
                edgePadding: { top: 350, right: 50, bottom: 350, left: 50 },
                animated: true,
              });
            }
          }, 500);
        }
      } else {
        Alert.alert("No Routes", "Could not find any routes.");
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const selectNextRoute = () => {
    if (routes.length === 0) return;
    const nextIndex = (selectedRouteIndex + 1) % routes.length;
    setSelectedRouteIndex(nextIndex);
    const nextRoute = routes[nextIndex];
    if (mapRef.current && nextRoute) {
        mapRef.current.fitToCoordinates(nextRoute.coordinates, {
            edgePadding: { top: 350, right: 50, bottom: 350, left: 50 },
            animated: true,
        });
    }
  };

  const startNavigation = () => {
    const currentRoute = routes[selectedRouteIndex];
    if (!currentRoute) return;
    const coords = currentRoute.coordinates;
    const dest = coords[coords.length - 1];
    const mid = coords[Math.floor(coords.length / 2)];

    let url = "";
    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?daddr=${dest.latitude},${dest.longitude}&via=1,${mid.latitude},${mid.longitude}&dirflg=d`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&waypoints=${mid.latitude},${mid.longitude}&travelmode=driving`;
    }
    Linking.canOpenURL(url).then((supported) => {
        if (supported) Linking.openURL(url);
    });
  };

  const selectedRoute = routes[selectedRouteIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* MAP */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 19.0760, longitude: 72.8777,
          latitudeDelta: 0.1, longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
      >
        {routes.map((route, index) => {
          const isSelected = index === selectedRouteIndex;
          let strokeColor = '#D1D5DB'; 
          if (isSelected) strokeColor = route.risk_level === 'Safe' ? '#10B981' : '#EF4444';
          return (
            <Polyline
              key={index}
              coordinates={route.coordinates}
              strokeColor={strokeColor}
              strokeWidth={isSelected ? 6 : 4}
              zIndex={isSelected ? 10 : 1}
              tappable={true}
              onPress={() => setSelectedRouteIndex(index)} 
            />
          );
        })}
        {selectedRoute && (
            <>
                <Marker coordinate={selectedRoute.coordinates[0]} title="Start">
                    <View style={styles.markerStart} />
                </Marker>
                <Marker coordinate={selectedRoute.coordinates[selectedRoute.coordinates.length - 1]} title="Destination" pinColor="red" />
            </>
        )}
      </MapView>

      {/* SEARCH CARD */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SafeAreaView>
          <View style={styles.searchCard}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>HerShield Safe Route</Text>
              <View style={{width: 40}} />
            </View>
            
            <View style={styles.inputGroup}>
                <View style={styles.timelineVisual}>
                    <View style={[styles.dot, {backgroundColor: '#10B981'}]} />
                    <View style={styles.dashedLine} />
                    <View style={[styles.dot, {backgroundColor: '#EF4444'}]} />
                </View>

                <View style={styles.inputsColumn}>
                    {/* GPS ROW */}
                    <View style={styles.inputWithIconRow}>
                        <TextInput 
                            style={[styles.input, { flex: 1 }]} 
                            placeholder="Current Location" 
                            placeholderTextColor="#9CA3AF"
                            value={origin}
                            onChangeText={setOrigin}
                        />
                        <TouchableOpacity 
                            style={styles.gpsButton} 
                            onPress={handleGetCurrentLocation} 
                            disabled={addressLoading}
                        >
                            {addressLoading ? (
                                <ActivityIndicator size="small" color="#111827" />
                            ) : (
                                <Text style={styles.gpsIcon}>📍</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Destination" 
                        placeholderTextColor="#9CA3AF"
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.goButton} onPress={fetchSafeRoutes} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.goButtonText}>Find Safe Routes</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* BOTTOM INFO CARD */}
      {selectedRoute && (
        <View style={styles.bottomCard}>
          <View style={styles.routeHeader}>
            <View>
              <Text style={styles.routeLabel}>ROUTE {selectedRouteIndex + 1} OF {routes.length}</Text>
              <Text style={styles.routeSummary} numberOfLines={1}>{selectedRoute.summary}</Text>
            </View>
            <View style={[styles.safetyBadge, { backgroundColor: selectedRoute.risk_level === 'Safe' ? '#ECFDF5' : '#FEF2F2' }]}>
                <Text style={[styles.safetyText, { color: selectedRoute.risk_level === 'Safe' ? '#059669' : '#DC2626' }]}>
                    {selectedRoute.safety_score}% Safe
                </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>TIME</Text>
                <Text style={styles.statValue}>{selectedRoute.duration.text}</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{selectedRoute.distance.text}</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>RISK</Text>
                <Text style={[styles.statValue, { color: selectedRoute.risk_level === 'Safe' ? '#059669' : '#D97706' }]}>
                    {selectedRoute.risk_level}
                </Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            {routes.length > 1 && (
                <TouchableOpacity style={styles.altRouteButton} onPress={selectNextRoute}>
                    <Text style={styles.altRouteText}>Alternative</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity 
                style={[styles.startNavButton, routes.length > 1 ? { flex: 1.5, marginLeft: 10 } : { width: '100%' }]}
                onPress={startNavigation} activeOpacity={0.8}
            >
                <Text style={styles.navButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ==================================================
// STYLES
// ==================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height },
  keyboardContainer: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  searchCard: { marginHorizontal: 16, marginTop: Platform.OS === 'android' ? 40 : 10, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  backArrow: { fontSize: 28, fontWeight: '300', color: '#111827', marginTop: -4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
  inputGroup: { flexDirection: 'row', marginBottom: 16 },
  timelineVisual: { alignItems: 'center', marginRight: 12, paddingTop: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dashedLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginVertical: 6, borderRadius: 1 },
  inputsColumn: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  inputWithIconRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  gpsButton: { padding: 10 },
  gpsIcon: { fontSize: 18 },
  input: { height: 48, paddingHorizontal: 16, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  goButton: { backgroundColor: '#111827', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center', shadowColor: "#111827", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  goButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  bottomCard: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: 'white', borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  routeLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginBottom: 4, letterSpacing: 0.5 },
  routeSummary: { fontSize: 18, fontWeight: '800', color: '#111827' },
  safetyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  safetyText: { fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  altRouteButton: { backgroundColor: '#F3F4F6', borderRadius: 14, height: 50, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  altRouteText: { color: '#374151', fontSize: 13, fontWeight: '700' },
  startNavButton: { backgroundColor: '#10B981', borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center', shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  navButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  markerStart: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }
});

export default SafeRouteScreen;