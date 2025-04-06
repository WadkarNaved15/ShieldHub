const React = require('react');
const { useState, useEffect } = require('react');
const { View, Text, TouchableOpacity, Alert } = require('react-native');
const MapView = require('react-native-maps').default;
const { Marker, Polyline } = require('react-native-maps');
const Tts = require('react-native-tts').default;
const GetLocation = require('react-native-get-location').default;

const HelperRouteScreen = () => {
    const [origin, setOrigin] = useState({ latitude: 19.068, longitude: 72.877 });
    const [destination, setDestination] = useState({ latitude: 19.0854, longitude: 72.8777 });
    const [route, setRoute] = useState([]);
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [travelMode, setTravelMode] = useState('drive');
    const [travelTime, setTravelTime] = useState(null);


    const crimeHotspots = [
        { latitude: 19.068, longitude: 72.877 },
        { latitude: 19.075, longitude: 72.874 }
    ];

    // Function to fetch user's current location
    const fetchCurrentLocation = async () => {
        try {
            const location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
            });

            setOrigin({
                latitude: location.latitude,
                longitude: location.longitude,
            });

            console.log("Current Location:", location);
        } catch (error) {
            console.error("Error fetching location:", error);
            Alert.alert("Location Error", "Ensure GPS is enabled.");
        }
    };

    // Function to fetch route
    const fetchRoute = async (mode) => {
        if (!origin) return;

        const travelModeMap = {
            driving: "DRIVE",
            walking: "WALK",
            bicycling: "BICYCLE",
            two_wheeler: "TWO_WHEELER"
        };

        const apiKey = 'AIzaSyAdBEEm04KruZ3_WkASVF7QX5Jy0Px8pf4';
        const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

        let requestBody = {
            origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
            destination: { location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } } },
            travelMode: travelModeMap[mode] || "DRIVE",
            computeAlternativeRoutes: true,
            languageCode: "en"
        };

        if (mode === "driving" || mode === "two_wheeler") {
            requestBody.routingPreference = "TRAFFIC_AWARE";
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "routes.legs.steps"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log("Response Data:", data);

            if (data.routes && data.routes.length) {
                let bestRoute = filterSafeRoute(data.routes);
                console.log("Best Route:", bestRoute);
                const points = bestRoute.polyline?.encodedPolyline;
                const routeSteps = bestRoute.legs[0].steps;
                const decodedPoints = decodePolyline(points);
                setRoute(decodedPoints);

                const durationInSeconds = parseInt(data.routes[0].legs[0].duration);
                const durationInMinutes = Math.ceil(durationInSeconds / 60);
                setTravelTime(`${durationInMinutes} min`);
                setSteps(routeSteps);
                setCurrentStepIndex(0);
                speakInstruction(routeSteps[0]);
            } else {
                Alert.alert("No route found.");
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };


    const decodePolyline = (encoded) => {
        let points = [];
        let index = 0;
        let lat = 0, lng = 0;
    
        while (index < encoded?.length) {
            let shift = 0, result = 0;
            let b;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    
            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    
            points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }
        return points;
    };

    const filterSafeRoute = (routes) => {
        console.log("routes",routes);
        return routes.find(route => 
            !route.legs[0].steps.some(step => 
                crimeHotspots.some(hotspot => 
                    getDistance(step.startLocation, hotspot) < 200
                )
            )
        ) || routes[0]; // Default to first route if no safe route found
    };
    // Function to calculate distance between two points
    const getDistance = (point1, point2) => {
        const R = 6371e3;
        const φ1 = point1.latitude * Math.PI / 180;
        const φ2 = point2.latitude * Math.PI / 180;
        const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
        const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Function to speak navigation instructions
    const speakInstruction = (step) => {
        if (step) {
            Tts.speak(step.navigationInstruction.instructions);
        }
    };

    // Function to monitor user location and progress through steps
    const monitorProgress = async () => {
        if (!steps.length || currentStepIndex >= steps.length) return;

        try {
            const location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
            });

            setOrigin({
                latitude: location.latitude,
                longitude: location.longitude,
            });

            const currentStep = steps[currentStepIndex];
            const stepEnd = {
                latitude: currentStep.endLocation.latitude,
                longitude: currentStep.endLocation.longitude,
            };

            const distance = getDistance(location, stepEnd);
            console.log(`Distance to next step: ${distance} meters`);

            if (distance < 20) { // If user is within 20 meters of step end, move to next step
                const nextStepIndex = currentStepIndex + 1;

                if (nextStepIndex < steps.length) {
                    setCurrentStepIndex(nextStepIndex);
                    speakInstruction(steps[nextStepIndex]);
                } else {
                    Tts.speak("You have arrived at your destination.");
                }
            }
        } catch (error) {
            console.error("Error fetching live location:", error);
        }
    };

    useEffect(() => {
        fetchCurrentLocation();
    }, []);

    useEffect(() => {
        if (origin) {
            fetchRoute(travelMode);
        }
    }, [travelMode, origin]);

    useEffect(() => {
        Tts.getInitStatus().then(() => {
            Tts.setDefaultLanguage('en-US');
            Tts.setDefaultRate(0.5);
            Tts.setDefaultPitch(1.0);
        }).catch(err => console.error("TTS Init Error:", err));
    }, []);

    useEffect(() => {
        const interval = setInterval(monitorProgress, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [steps, currentStepIndex]);

    return (
        <View style={{ flex: 1 }}>
        <MapView
            style={{ flex: 1 }}
            region={origin ? {
                latitude: origin.latitude,
                longitude: origin.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            } : undefined}
        >
            {origin && <Marker coordinate={origin} pinColor='green' title='Start' />}
            <Marker coordinate={destination} pinColor='red' title='Destination' />
            <Polyline coordinates={route} strokeWidth={4} strokeColor="purple" />
        </MapView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
            {['drive', 'walk', 'bicycle'].map(mode => (
                <TouchableOpacity
                    key={mode}
                    onPress={() => setTravelMode(mode)}
                    style={{
                        backgroundColor: travelMode === mode ? '#7157e4' : '#E8E8E8',
                        padding: 10,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: travelMode === mode ? '#fff' : '#000' }}>{mode.toUpperCase()}</Text>
                </TouchableOpacity>
            ))}
        </View>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Estimated Time: {travelTime || 'Calculating...'}</Text>
    </View>
    );
};

module.exports = HelperRouteScreen;
