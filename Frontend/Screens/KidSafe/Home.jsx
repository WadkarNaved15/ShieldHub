const React = require('react');
const { useState, useEffect,useContext } = require('react');
const { View, Text, TouchableOpacity, ScrollView, SafeAreaView ,Alert,Image,PermissionsAndroid,StyleSheet,ActivityIndicator} = require('react-native');
const { Home, Map, Bell, Users, Phone, Shield, AlertCircle, CheckCircle2, Clock, Activity, School, MapPin } = require('lucide-react-native');
var GetLocation = require('react-native-get-location').default;
const MapView = require('react-native-maps').default;
const { PROVIDER_GOOGLE } = require('react-native-maps');
const { Marker,Polyline } = require('react-native-maps');
const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
const  apiCall  = require('../../functions/axios');
const { UserContext } = require('../../Context/User');
const { LocationContext } = require('../../Context/Location');
const {useNavigation} = require('@react-navigation/native');

function NavigationButton({ Icon, label, isActive, onPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        alignItems: 'center',
        padding: 10,
        transform: [{ scale: isActive ? 1.1 : 1 }],
      }}
    >
      <Icon size={28} color={isActive ? '#A78BFA' : 'gray'} />
      <Text style={{ fontSize: 12, color: isActive ? '#A78BFA' : 'gray', marginTop: 2 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function KidSafeHome() {
  const [activeTab, setActiveTab] = useState('home');
  const {logout,user} = useContext(UserContext);
  const {location} = useContext(LocationContext);
  const [loading, setLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState('😊');
  const [isEmergencyMode, setEmergencyMode] = useState(false);
  const [isSafe, setIsSafe] = useState(false);
  const [placeLocation, setPlaceLocation] = useState('school');
  const defaultMaleImage = require('./../../assets/male.png');
  const defaultFemaleImage = require('./../../assets/female.png');
  const navigation = useNavigation();

  const region = {
    latitude: location?.latitude,
    longitude: location?.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
}
  console.log("kid location",location );

  const MapComponent = ({ location }) => {
    return (
      <View style={{ height: 200, width: '100%', borderRadius: 15, overflow: 'hidden', marginTop: 15 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          // customMapStyle={customMapStyle}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={
                    user.profileImage
                      ? { uri: user.profileImage }
                      : user.gender === 'Male'
                        ? require('../../assets/male.png')
                        : require('../../assets/female.png')
                  }
                  style={styles.userImage}
                />
              </View>
              <View style={styles.markerPin} />
            </View>
          </Marker>
        </MapView>
      </View>
    );
  };
  
  
  const handleCheckIn = () => {
    setIsSafe(true);
    setPlaceLocation('home');
  };

   if ( !user || !location) {
          return (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text>Loading...</Text>
              </View>
          );
        }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7ED', paddingBottom: 80 }}>
      {/* Header */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4B5563' }}>Hi Priya 👋</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: '#FFFFFFAA', padding: 10, borderRadius: 20 }}>
          <MapPin size={20} color="#A78BFA" />
          <Text style={{ fontSize: 16, color: '#6B7280', marginLeft: 5 }}>
            Aarav is at {placeLocation}
          </Text>
          <Shield size={20} color="green" style={{ marginLeft: 5 }} />
        </View>
       
      </View>

      {/* Main Content */}
      <ScrollView style={{ paddingHorizontal: 20,marginBottom: 20 }}>
      <MapComponent location={location} />

<TouchableOpacity 
  onPress={() => setEmergencyMode(!isEmergencyMode)}
  style={{
    marginTop: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: isEmergencyMode ? 'red' : '#FFF',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  }}
>
  <AlertCircle size={18} color={isEmergencyMode ? '#FFF' : 'red'} />
  <Text style={{ color: isEmergencyMode ? '#FFF' : 'red', marginLeft: 5 }}>Emergency</Text>
</TouchableOpacity>
        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 , marginTop: 20}}>
          <TouchableOpacity style={{ alignItems: 'center',width: '48%', padding: 15, backgroundColor: '#FFF', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 }}>
            <Phone size={40} color="#A78BFA" />
            <Text style={{ marginTop: 5 }}>Call Aarav</Text>
          </TouchableOpacity>
          {!isSafe && (
            <TouchableOpacity 
              onPress={handleCheckIn}
              style={{ alignItems: 'center',width: '48%', padding: 15, backgroundColor: '#A7F3D0', borderRadius: 20 }}
            >
              <CheckCircle2 size={40} color="green" />
              <Text style={{ marginTop: 5 }}>I'm Safe!</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mood */}
        <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: '#4B5563' }}>Mood & Updates</Text>
          <Text style={{ fontSize: 18, color: '#6B7280', marginTop: 10 }}>Aarav feels {currentMood} today</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
            {['😊', '😐', '😢'].map((mood) => (
              <TouchableOpacity 
                key={mood}
                onPress={() => setCurrentMood(mood)}
                style={{
                  padding: 10,
                  borderRadius: 50,
                  backgroundColor: currentMood === mood ? '#A7F3D0' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 24 }}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Summary */}
        <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: '#4B5563' }}>Today's Activities</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <View style={{ alignItems: 'center' }}>
              <Activity size={40} color="#A78BFA" />
              <Text>Steps</Text>
              <Text style={{ fontWeight: 'bold' }}>2,547</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <School size={40} color="#A78BFA" />
              <Text>Classes</Text>
              <Text style={{ fontWeight: 'bold' }}>5/6</Text>
            </View>
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 20 }}>
          <Text style={{ fontSize: 16, color: '#4B5563' }}>Recent Updates</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Clock size={20} color="blue" />
            <Text style={{ marginLeft: 10 }}>3:45 PM - Aarav left school</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Clock size={20} color="blue" />
            <Text style={{ marginLeft: 10 }}>1:30 PM - Completed lunch</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#FFF', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <NavigationButton Icon={Home} label="Home" isActive={activeTab === 'home'} onPress={() => setActiveTab('home')} />
        <NavigationButton Icon={Map} label="Journey" isActive={activeTab === 'journey'} onPress={() => setActiveTab('journey')} />
        <NavigationButton Icon={Bell} label="Alerts" isActive={activeTab === 'alerts'} onPress={() => setActiveTab('alerts')} />
        <NavigationButton Icon={Users} label="Profile" isActive={activeTab === 'profile'} onPress={() => navigation.navigate('Modules')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    backgroundColor: '#fff',
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  markerPin: {
    width: 10,
    height: 10,
    backgroundColor: '#8b5cf6',
    borderRadius: 5,
    marginTop: 4,
  },
});

  // const customMapStyle = [
  //   {
  //     featureType: 'all',
  //     elementType: 'geometry',
  //     stylers: [{ color: '#f5f3ff' }],
  //   },
  //   {
  //     featureType: 'water',
  //     elementType: 'geometry',
  //     stylers: [{ color: '#c4b5fd' }],
  //   },
  // ];
module.exports = KidSafeHome;
