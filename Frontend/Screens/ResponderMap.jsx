import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { LocationContext } from '../Context/Location';
import apiCall from '../functions/axios';
import { UserContext } from '../Context/User';
import io from 'socket.io-client';
import { Phone, Navigation as NavIcon, X } from 'lucide-react-native';
// import Config from 'react-native-config';
import { BACKEND_URI } from '@env';
import{ GOOGLE_MAPS_API_KEY } from '@env';
const { width, height } = Dimensions.get('window');



const ResponderMap = ({ route, navigation }) => {
   

console.log(BACKEND_URI, GOOGLE_MAPS_API_KEY);
    const { victimId,   initialLat, initialLon } = route.params || {};
    const [victimName, setVictimName] = useState('');
const [victimPhone, setVictimPhone] = useState('');

if (!initialLat || !initialLon) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading victim location…</Text>
    </View>
  );
}

    const { location: myLocation } = useContext(LocationContext);
    const { user } = useContext(UserContext); // Current logged-in responder
    
    const mapRef = useRef(null);
    const socket = useRef(null);

    const [victimLocation, setVictimLocation] = useState({
        latitude: parseFloat(initialLat),
        longitude: parseFloat(initialLon),
    });
    const [otherResponders, setOtherResponders] = useState({});
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });

    

    useEffect(() => {
  const fetchVictim = async () => {
    
    try {
      const res = await apiCall({
        url: `/users/${victimId}`,   // 👈 backend victim API
        method: 'GET',
      });

      console.log("🧪 Victim API response:", res.data);

      setVictimName(res.data.fullName || res.data.name || "Victim");
      setVictimPhone(res.data.phoneNumber);
    } catch (err) {
      console.log('❌ Failed to fetch victim', err);
    }
  };

  if (victimId) fetchVictim();
});

useEffect(() => {
  console.log('👤 Victim name state updated:', victimName);
}, [victimName]);

    useEffect(() => {
        console.log("🛠️ Joining Room with ID:", victimId);
        // 1. Connect to Socket Server
      socket.current = io(BACKEND_URI, {
        transports: ['websocket'], 
        forceNew: true 
    });

        // 2. Join the specific emergency room
        socket.current.emit('join_emergency', {
  emergencyId: String(victimId),
  userId: user._id,
}, [victimId]);

        // 3. Listen for victim movement
        socket.current.on('victim_moved', (data) => {
            if (data.userId === victimId) {
                setVictimLocation({
                    latitude: data.latitude,
                    longitude: data.longitude
                });
            }
        });


        // Inside useEffect in ResponderMap.jsx
socket.current.on('emergency_resolved', (data) => {
    Alert.alert(
        "Emergency Resolved", 
        data.message || "The situation is under control. Thank you for your help!",
        [{ text: "OK", onPress: () => navigation.navigate('Home') }]
    );
});

console.log("📱 Sending My Phone Number:", user.phoneNumber);
        // 4. Listen for other responders movement
        socket.current.on('responder_moved', (data) => {
            if (data.userId !== user._id) { // Don't track yourself via socket
                setOtherResponders(prev => ({
                    ...prev,
                    [data.userId]: {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        name: data.userName,
                        phoneNumber: data.phoneNumber,
                    }
                }));
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [victimId]);

    // 5. Send your live location to everyone else
    // useEffect(() => {
    //     if (myLocation && socket.current) {
    //         socket.current.emit('move_responder', {
    //             emergencyId: victimId,
    //             userId: user._id,
    //             userName: user.name,
    //             latitude: myLocation.latitude,
    //             longitude: myLocation.longitude
    //         });
    //     }
    // }, [myLocation]);



    useEffect(() => {
  if (!socket.current || !myLocation) return;

  const interval = setInterval(() => {
    socket.current.emit('move_responder', {
      emergencyId: String(victimId),
      userId: user._id,
      userName: user.name,
      latitude: myLocation.latitude,
      longitude: myLocation.longitude
    });
  }, 3000); // every 3 seconds

  return () => clearInterval(interval);
}, [myLocation, victimId]);

    const fitToMarkers = () => {
        if (myLocation && victimLocation) {
            mapRef.current?.fitToCoordinates([myLocation, victimLocation], {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
            });
        }
    };

    const handleHelpArrived = () => {
    Alert.alert(
        "Confirm Arrival",
        "Are you sure you have reached the victim?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Yes, I'm here", 
                onPress: () => {
                    // 1. Tell the server to resolve the room
                    socket.current.emit('resolve_emergency', { emergencyId: victimId });
                    
                    // 2. Go back to Home
                    navigation.navigate('Home'); 
                } 
            }
        ]
    );
};


    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    ...victimLocation,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                onMapReady={fitToMarkers}
            >
                {/* Victim Marker */}
                <Marker 
                 key={victimName}
                    coordinate={victimLocation} 
                    title={victimName || "Victim"}
                    zIndex={10}
                >
                    <View style={styles.victimMarkerContainer}>
                        <View style={styles.pulseCircle} />
                        <View style={styles.victimDot} />
                    </View>
                </Marker>

                {/* Other Responders Markers */}
                {Object.values(otherResponders).map((res, index) => (
                    <Marker
                        key={res.userId}
                        coordinate={{ latitude: res.latitude, longitude: res.longitude }}
                        title={res.name}
                        pinColor="orange"
                    />
                ))}

                {/* My Location Marker */}
                {myLocation && (
                    <Marker 
                        coordinate={myLocation} 
                        title="Me" 
                        pinColor="blue" 
                    />
                )}

                {/* Route Drawing */}
               {myLocation && victimLocation && (
    <MapViewDirections
        origin={myLocation}
        destination={victimLocation} // Uses the dynamic state from your socket
        apikey={GOOGLE_MAPS_API_KEY}
        strokeWidth={5}
        strokeColor="#ef4444"
        mode="WALKING"
        resetOnChange={false} // Important: prevents the map from flickering on every update
        onReady={(result) => {
            setRouteInfo({
                distance: result.distance.toFixed(1),
                duration: Math.ceil(result.duration)
            });
        }}
        onError={(errorMessage) => {
            console.log('Directions Error: ', errorMessage);
        }}
    />
)}
            </MapView>

            {/* UI Overlays */}
            <SafeAreaView style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <X color="white" size={24} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.emergencyTitle}>EMERGENCY IN PROGRESS</Text>
                       <Text style={styles.victimStatus}>
  {victimName && victimName.length > 0
    ? `${victimName} needs help`
    : 'Victim needs help'}
  {routeInfo.distance > 0 ? ` • ${routeInfo.distance} km away` : ''}
</Text>
                    </View>
                </View>

                {/* // ... inside your return() block in ResponderMap.jsx */}
<View style={styles.bottomCard}>
    <View style={styles.infoRow}>
        <View>
            <Text style={styles.etaText}>{routeInfo.duration} mins</Text>
            <Text style={styles.subText}>Away from {victimName}</Text>
        </View>
        
        {/* ADD THE BUTTON HERE */}
        <TouchableOpacity 
            style={styles.arrivedBtn} 
            onPress={handleHelpArrived}
        >
            <Text style={styles.arrivedBtnText}>HELP ARRIVED</Text>
        </TouchableOpacity>
    </View>
</View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, justifyContent: 'space-between', padding: 15 },
    header: { backgroundColor: '#ef4444', flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 5 },
    closeBtn: { padding: 5 },
    headerText: { marginLeft: 15 },
    emergencyTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    victimStatus: { color: 'white', opacity: 0.9 },
    bottomCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    etaText: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    subText: { color: '#6b7280' },
    actionRow: { flexDirection: 'row', gap: 10 },
    iconBtn: { padding: 12, borderRadius: 50 },
    victimMarkerContainer: { alignItems: 'center', justifyContent: 'center' },
    pulseCircle: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.3)' },
    victimDot: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: 'white' },


    arrivedBtn: {
        backgroundColor: '#22c55e', // Success Green
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 3,
    },
    arrivedBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ResponderMap;