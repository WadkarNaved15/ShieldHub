import React, { useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@env';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../functions/axios'; 
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const GeoFence = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerCoord, setMarkerCoord] = useState({
    latitude: 19.076,
    longitude: 72.8777,
  });

  const [radius, setRadius] = useState(300);
  const [zoneName, setZoneName] = useState('');
  const [kidName, setKidName] = useState('Kid');
  const [searchText, setSearchText] = useState('');



 const fetchPlaceFromGoogle = async (placeName) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK") {
      const loc = data.results[0].geometry.location;

      setMarkerCoord({ latitude: loc.lat, longitude: loc.lng });
      setRegion({
        latitude: loc.lat,
        longitude: loc.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // ✅ Move the map to the new location
      mapRef.current?.animateToRegion({
        latitude: loc.lat,
        longitude: loc.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      Alert.alert("Not Found", "Could not find the location.");
    }
  } catch (err) {
    Alert.alert("Error", "Something went wrong.");
    console.log(err);
  }
};



  const handleSave = async () => {
    if (!zoneName || !radius || isNaN(radius)) {
      return Alert.alert('Validation', 'Please enter all fields correctly.');
    }

    try {
      const res = await apiCall({
        method: 'POST',
        url: '/geofence/create',
        data: {
          latitude: markerCoord.latitude,
          longitude: markerCoord.longitude,
          radius: parseInt(radius),
          label: zoneName,
          kid: kidName,
          // parentId,
        },
      });

      Alert.alert('Success', res.message || 'Geofence saved!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save geofence');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📍 Set Safe Zone</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>

     <TextInput
  placeholder="Search location (e.g. Delhi Public School)"
  style={styles.input}
  value={searchText}
  onChangeText={setSearchText}
  onSubmitEditing={() => fetchPlaceFromGoogle(searchText)}
  placeholderTextColor="#888"
/>


      <MapView
        style={styles.map}
        // region={region}
          initialRegion={region}  // Use this instead of `region`
        // onRegionChangeComplete={setRegion}
        onPress={(e) => setMarkerCoord(e.nativeEvent.coordinate)}
        //  ref={(ref) => (mapRef = ref)}
        ref={mapRef}
      >
        <Marker
          coordinate={markerCoord}
          draggable
          onDragEnd={(e) => setMarkerCoord(e.nativeEvent.coordinate)}
        />
        <Circle
          center={markerCoord}
          radius={parseInt(radius)}
          strokeWidth={2}
          strokeColor="rgba(0,122,255,0.8)"
          fillColor="rgba(0,122,255,0.2)"
        />
      </MapView>

      <View style={styles.controls}>
        <Text style={styles.label}>Zone Name</Text>
        <TextInput
          placeholder="e.g. School, Home"
          value={zoneName}
          onChangeText={setZoneName}
          style={styles.input}
        />

        <Text style={styles.label}>Radius (in meters)</Text>
        <TextInput
          placeholder="e.g. 300"
          value={radius.toString()}
          onChangeText={(val) => setRadius(val.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Kid Name</Text>
        <TextInput
          placeholder="Enter Kid's Name"
          value={kidName}
          onChangeText={setKidName}
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Geofence</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={{ color: '#3B82F6', textAlign: 'center' }}>← Cancel</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
    </View>

  );
};

export default GeoFence;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'center',
    color: '#1F2937',
  },
 map: {
  width: '100%',
  height: 300, // ✅ Give it a fixed height
  borderRadius: 15,
  marginBottom: 10,
},

  controls: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  },
  input: {
  borderWidth: 1,
  borderColor: '#D1D5DB',        // Light gray border
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  backgroundColor: '#FFF',       // White background
  marginHorizontal: 20,          // Space on sides
  marginTop: 20,                 // Space from top
  elevation: 2,                  // Android shadow
  shadowColor: '#000',           // iOS shadow
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
}

});
