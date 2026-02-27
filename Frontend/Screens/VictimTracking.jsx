import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationContext } from '../Context/Location';
import { UserContext } from '../Context/User';
import io from 'socket.io-client';
import { ShieldCheck, PhoneCall, XCircle } from 'lucide-react-native';
import { Animated, Easing } from 'react-native';
import { BACKEND_URI } from '@env';
import{ GOOGLE_MAPS_API_KEY } from '@env';

const VictimTracking = ({ navigation }) => {
    const { location: myLocation } = useContext(LocationContext);
    const { user } = useContext(UserContext);
    const socket = useRef(null);
    const [heroes, setHeroes] = useState({}); // Track multiple responders

    const pulseAnim = useRef(new Animated.Value(0)).current;
    const mapRef = useRef(null);

useEffect(() => {
    if (Object.keys(heroes).length > 0 && myLocation) {
        const coords = Object.values(heroes).map(h => ({
            latitude: parseFloat(h.latitude),
            longitude: parseFloat(h.longitude)
        }));
        coords.push(myLocation);

        mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
        });
    }
}, [heroes]);

useEffect(() => {
    Animated.loop(
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
            }),
        ])
    ).start();
}, []);

    useEffect(() => {
        // 1. Connect to Socket
        socket.current = io(BACKEND_URI); // Use WebSocket URI

         // 3. Listen for Responders moving
        socket.current.on('responder_moved', (data) => {
             console.log("🧭 Hero update:", data);
            setHeroes(prev => ({
                ...prev,
                [data.userId]: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    name: data.userName,
                    phoneNumber: data.phoneNumber
                }
            }));
        });

        // 2. Join private room using my own ID
        socket.current.emit('join_emergency', {
  emergencyId: String(user._id),
  userId: user._id,
});

       

        // 4. Listen for Emergency Resolution (Help arrived)
        socket.current.on('emergency_resolved', () => {
            Alert.alert("Help is Here!", "A responder has reached your location.");
            navigation.navigate('Home');
        });

        return () => socket.current.disconnect();
    }, []);

    // 5. Send Victim's live location to the room
    useEffect(() => {
        if (myLocation && socket.current) {
            socket.current.emit('move_victim', {
                emergencyId: user._id,
                userId: user._id,
                latitude: myLocation.latitude,
                longitude: myLocation.longitude
            });
        }
    }, [myLocation]);



    // VictimTracking.jsx ke andar ye function add karein
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
};

// Phir apne component mein sabse paas wale hero ki distance nikaalein
const getClosestHeroDistance = () => {
    const heroList = Object.values(heroes);
    if (heroList.length === 0) return null;
    
    const distances = heroList.map(h => calculateDistance(myLocation.latitude, myLocation.longitude, h.latitude, h.longitude));
    return distances.sort()[0]; // Sabse kam distance
};

   const handleSafe = () => {
    Alert.alert(
        "Confirm Safety",
        "Are you safe now? This will notify all responders to stop.",
        [
            { text: "No, Stay on Map", style: "cancel" },
            { 
                text: "Yes, I'm Safe", 
                onPress: () => {
                    // 1. Tell the socket room to resolve
                    socket.current.emit('resolve_emergency', { 
                        emergencyId: user._id,
                        status: 'SAFE_BY_VICTIM' 
                    });
                    
                    // 2. Clear local tracking and go home
                    navigation.navigate('Home');
                },
                style: "default"
            }
        ]
    );
};

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude: myLocation?.latitude || 0,
                    longitude: myLocation?.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* Victim (Me) Marker */}
                {myLocation && (
                    <Marker coordinate={myLocation}>
    <View style={styles.victimMarkerContainer}>
        {/* Pulsing Outer Circle */}
        <Animated.View style={[
            styles.pulseCircle,
            {
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })
            }
        ]} />
        {/* Inner Solid Circle */}
        <View style={styles.victimDot} />
    </View>
</Marker>
                )}



               {/* Approaching Heroes */}
{Object.values(heroes).map((hero, index) => (
    <Marker
        // key={hero.userId}
        key={`hero-${hero.userId || hero.socketId || index}`}
        coordinate={{ 
            latitude: parseFloat(hero.latitude), 
            longitude: parseFloat(hero.longitude) 
        }}
        onPress={() => {
            if (hero.phoneNumber) {
                Alert.alert(
                    `Call ${hero.name}`,
                    "Do you want to contact this responder?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Call", onPress: () => Linking.openURL(`tel:${hero.phoneNumber}`) }
                    ]
                );
            } else {
                Alert.alert("Error", "Phone number not shared by responder.");
            }
        }}
        title={hero.name}
    >
        {/* Custom Circle Design */}
        <View style={styles.heroMarkerContainer}>
            <View style={styles.heroCircle} />
            <Text style={styles.heroNameTag}>{hero.name}</Text>
        </View>
    </Marker>
))}
            </MapView>

            <SafeAreaView style={styles.overlay}>
                <View style={styles.statusHeader}>
                    <ShieldCheck color="#22c55e" size={28} />
                    <View style={styles.headerText}>
                        <Text style={styles.statusTitle}>Help is on the way</Text>
                        <Text style={styles.statusSub}>{Object.keys(heroes).length} Hero(es) responding</Text>
                        <Text style={styles.statusSub}>
    {Object.keys(heroes).length > 0 
        ? `Closest hero is ${getClosestHeroDistance()} away` 
        : "Searching for nearby heroes..."}
</Text>
                    </View>
                </View>

                <View style={styles.bottomCard}>
                    <TouchableOpacity style={styles.callPoliceBtn}>
                        <PhoneCall color="white" size={20} />
                        <Text style={styles.btnText}>Call Police</Text>
                    </TouchableOpacity>
                    

                   <TouchableOpacity style={styles.safeBtn} onPress={handleSafe}>
    <ShieldCheck color="white" size={20} />
    <Text style={styles.safeBtnText}>I AM SAFE NOW</Text>
</TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

// ... Styles (included below)

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, justifyContent: 'space-between', padding: 20 },
    statusHeader: { backgroundColor: 'white', flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 10 },
    headerText: { marginLeft: 12 },
    statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    statusSub: { color: '#6b7280' },
    bottomCard: { gap: 10 },
    callPoliceBtn: { backgroundColor: '#ef4444', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, gap: 10 },
    cancelBtn: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: '#f3f4f6' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    cancelText: { color: '#ef4444', fontWeight: 'bold' },
    victimMarkerContainer: { alignItems: 'center', justifyContent: 'center' },
    pulseCircle: { position: 'absolute', width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    victimDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ef4444', borderWidth: 2, borderColor: 'white' },

    safeBtn: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 10
},
safeBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
},
heroMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
},
heroCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f97316', // Orange color for Responders
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
},
heroNameTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
}
});


// At the bottom of VictimTracking.jsx
export default VictimTracking;