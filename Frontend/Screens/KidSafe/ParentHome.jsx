import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import apiCall from "../../functions/axios";
import MapView, { Marker } from 'react-native-maps';
import { reverseGeocode } from '../../functions/reverseGeocode';
import  Card  from '../../Components/Card';
import { MapPin, User, Calendar, LocateIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
const {
  Home,
  Map,
  Bell,
  Users,
  Phone,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  School,
  
} = require('lucide-react-native');

function NavigationButton({Icon, label, isActive, onPress}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        padding: 10,
        transform: [{scale: isActive ? 1.1 : 1}],
      }}>
      <Icon size={28} color={isActive ? '#A78BFA' : 'gray'} />
      <Text
        style={{
          fontSize: 12,
          color: isActive ? '#A78BFA' : 'gray',
          marginTop: 2,
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const ParentHome = ({ route }) => {
  const { kid } = route.params;
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const navigation = useNavigation();

    const [activeTab, setActiveTab] = useState('home');
  

  const fetchLiveLocation = async () => {
    const res = await apiCall({ url: `/parent/kid-live-location?kidId=${kid._id}`, method: 'GET' });

    if (res.success) {
      setLocation({
        latitude: parseFloat(res.location.latitude),
        longitude: parseFloat(res.location.longitude),
      });
      const addr = await reverseGeocode(res.location.latitude, res.location.longitude);
      setAddress(addr);
    } else {
      console.warn('❌ Location fetch failed:', res.message);
    }
  };

  useEffect(() => {
    fetchLiveLocation();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Parent Dashboard</Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}><User size={18} /> Name: <Text style={styles.bold}>{kid.fullName}</Text></Text>
        <Text style={styles.cardText}><Calendar size={18} /> Age: <Text style={styles.bold}>{kid.age}</Text></Text>
        <Text style={styles.cardText}><User size={18} /> Gender: <Text style={styles.bold}>{kid.gender}</Text></Text>
      </Card>

      {location && (
        <Card style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={location} title="Kid's Location" description="Live tracked" />
          </MapView>
        </Card>
      )}

      {location && (
        <Card style={styles.card}>
          <Text style={styles.cardText}><LocateIcon size={18} /> Latitude: <Text style={styles.bold}>{location.latitude}</Text></Text>
          <Text style={styles.cardText}><LocateIcon size={18} /> Longitude: <Text style={styles.bold}>{location.longitude}</Text></Text>
          <Text style={styles.cardText}><MapPin size={18} />Kid Address: <Text style={styles.bold}>{address || 'Fetching address...'}</Text></Text>
        </Card>
      )}

      <Text style={styles.footer}>✨ More features coming soon...</Text>

      
    </ScrollView>


{/* Bottom Navigation Bar */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        backgroundColor: '#FFF',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <NavigationButton
        Icon={Home}
        label="Dashboard"
        isActive={activeTab === 'dashboard'}
        onPress={() => {
          setActiveTab('dashboard');
          navigation.navigate('ParentHome', { kid });
        }}
      />
      <NavigationButton
        Icon={Map}
        label="Schedule"
        isActive={activeTab === 'schedule'}
        onPress={() => {
         setActiveTab('schedule'); 
          navigation.navigate('Schedule', { kidId: kid._id });
        }}
      />
      <NavigationButton
        Icon={Bell}
        label="Activity"
        isActive={activeTab === 'activity'}
        onPress={() => {
          setActiveTab('activity');
          navigation.navigate('ParentActivityLog', { kidId: kid._id });
        }}
      />
      <NavigationButton
        Icon={Users}
        label="Kid Info"
        isActive={activeTab === 'profile'}
        onPress={() => {
          setActiveTab('profile');
          navigation.navigate('Modules');
        }}
      />
    </View>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    marginVertical: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  mapContainer: {
    overflow: 'hidden',
    borderRadius: 20,
    height: 300,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 40,
  },
});

export default ParentHome;
