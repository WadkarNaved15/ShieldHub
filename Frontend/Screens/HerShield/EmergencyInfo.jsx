const React =require('react');
const { useState, useContext, useEffect, useRef } = React;
const { View, Text, TouchableOpacity, Image, StyleSheet, Animated } = require('react-native');
const { Shield, MapPin, Users, Clock, VolumeIcon, Volume2Icon } = require('lucide-react-native');
const { navigate } = require('../../services/navigationService');
const MapView = require('react-native-maps').default;
const { Marker, Polyline } = require('react-native-maps');
const { LocationContext } = require('../../Context/Location');


function EmergencyInfo() {
  const [showFullRoute, setShowFullRoute] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const {location} = useContext(LocationContext);

  
  const region = {
    latitude: location?.latitude,
    longitude: location?.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
}

const nearestHelper = {
    latitude: 19.0599,
    longitude: 72.8801,
  };

const mapRef = useRef();

useEffect(() => {
  if (location && mapRef.current) {
    mapRef.current.fitToCoordinates(
      [
        { latitude: location.latitude, longitude: location.longitude }, // User
        { latitude: 19.0610, longitude: 72.8805 }, // Helper 1
        { latitude: 19.0585, longitude: 72.8773 }, // Helper 2
        { latitude: 19.0599, longitude: 72.8801 }, // Helper 3
      ],
      {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      }
    );
  }
}, [location]);


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Glowing Shield Icon */}
        <View style={styles.shieldContainer}>
          <View style={styles.shieldGlow} />
          <Shield style={styles.shieldIcon} color="#7157e4" size={64} />
        </View>

        {/* Reassuring Headline */}
        <Text style={styles.headline}>
          Help is on the way
        </Text>

        {/* Stylized Map */}
        <View style={styles.mapContainer}>
        <MapView
  ref={mapRef}
  style={styles.mapBackground}
  initialRegion={region}
>
{showFullRoute && (
  <Polyline
    coordinates={[
      { latitude: location.latitude, longitude: location.longitude },
      nearestHelper,
    ]}
    strokeColor="#7157e4"
    strokeWidth={4}
  />
)}
    {/* User's Location Marker */}
    <Marker
      coordinate={{ latitude: location.latitude, longitude: location.longitude }}
      title="You"
      description="Your current location"
    >
      <MapPin color="#7157e4" size={32} />
    </Marker>

    {/* Helper markers */}
    <Marker
      coordinate={{ latitude: 19.0610,
        longitude: 72.8805
         }}
      pinColor="green"
      title="Helper 1"
    />
    <Marker
      coordinate={{latitude: 19.0585,
        longitude: 72.8773
        }}
      pinColor="green"
      title="Helper 2"
    />
    <Marker
      coordinate={{ latitude: 19.0599,
        longitude: 72.8801
         }}
      pinColor="green"
      title="Helper 3"
    />
  </MapView>
</View>

        {/* Status Information */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Users color="#4B5563" size={20} />
            <Text style={styles.statusText}>3 verified responders notified</Text>
          </View>
          <View style={styles.statusItem}>
            <Clock color="#4B5563" size={20} />
            <Text style={styles.statusText}>Nearest helper ETA: 3 minutes</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Route Toggle */}
          <TouchableOpacity
            onPress={() => setShowFullRoute(!showFullRoute)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {showFullRoute ? 'Hide full route' : 'Show full route'}
            </Text>
          </TouchableOpacity>

          {/* Voice Toggle */}
          <TouchableOpacity
            onPress={() => setVoiceEnabled(!voiceEnabled)}
            style={styles.button}
          >
            <View style={styles.buttonContent}>
              {voiceEnabled ? <Volume2Icon color="#4B5563" size={20} /> : <VolumeIcon color="#4B5563" size={20} />}
              <Text style={styles.buttonText}>
                {voiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cancel Button */}
          {!showCancelConfirm ? (
            <TouchableOpacity
              onPress={() => setShowCancelConfirm(true)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel SOS</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                onPress={() => setShowCancelConfirm(false)}
                style={styles.keepActiveButton}
              >
                <Text style={styles.keepActiveText}>Keep Active</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigate('Home')}
                style={styles.confirmCancelButton}
              >
                <Text style={styles.confirmCancelText}>Confirm Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 24,
    gap: 24,
  },
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#7157e4',
    borderRadius: 40,
    opacity: 0.2,
  },
  shieldIcon: {
    width: 64,
    height: 64,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
  },
  mapContainer: {
    height: 192,
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
  },
  
  locationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  markerGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#7157e4',
    borderRadius: 20,
    opacity: 0.3,
  },
  markerIcon: {
    width: 32,
    height: 32,
  },
  helperDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#22C55E',
    borderRadius: 6,
  },
  helperDot1: {
    top: '25%',
    right: '25%',
  },
  helperDot2: {
    bottom: '33%',
    left: '33%',
  },
  helperDot3: {
    top: '33%',
    left: '25%',
  },
  statusContainer: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    color: '#4B5563',
    fontSize: 16,
  },
  controls: {
    gap: 16,
  },
  button: {
    width: '100%',
    padding: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  keepActiveButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  keepActiveText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmCancelButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

module.exports = EmergencyInfo;
