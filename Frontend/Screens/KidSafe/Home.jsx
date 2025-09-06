const React = require('react');
const {useState, useEffect, useContext} = require('react');
const {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  Linking,
  PermissionsAndroid,
  StyleSheet,
  ActivityIndicator,
  Modal,
} = require('react-native');
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
  MapPin,
} = require('lucide-react-native');
var GetLocation = require('react-native-get-location').default;
const MapView = require('react-native-maps').default;
const {PROVIDER_GOOGLE} = require('react-native-maps');
const {Marker, Polyline} = require('react-native-maps');
const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
const apiCall = require('../../functions/axios');
const {UserContext} = require('../../Context/User');
const {LocationContext} = require('../../Context/Location');
const {useNavigation} = require('@react-navigation/native');

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

function KidSafeHome() {
  const [activeTab, setActiveTab] = useState('home');
  const {logout, user} = useContext(UserContext);
  const {location} = useContext(LocationContext);
  const [loading, setLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState('😊');
  const [isEmergencyMode, setEmergencyMode] = useState(false);
  const [isSafe, setIsSafe] = useState(false);
  const [placeLocation, setPlaceLocation] = useState('school');
  const defaultMaleImage = require('./../../assets/male.png');
  const defaultFemaleImage = require('./../../assets/female.png');
  const navigation = useNavigation();
  const [parentInfo, setParentInfo] = useState(null);
  const [classList, setClassList] = useState([]);
  const [showClassList, setShowClassList] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [logs, setLogs] = useState([]);

//  useEffect(() => {
//   const fetchLogs = async () => {
//     try {
//       const res = await apiCall({ url: '/logs/recent', method: 'GET' });
//         console.log("📦 Logs fetched from backend:", res.logs);
//       setLogs(res.logs || []);
//     } catch (err) {
//       console.log("Error fetching activity logs", err);
//     }
//   };

//   fetchLogs();
// }, []);


const refreshLogs = async () => {
  try {
    const res = await apiCall({ url: '/kid/logs/recent', method: 'GET' });
    console.log("📥 Refreshed logs:", res.logs);
    setLogs(res.logs || []);
  } catch (err) {
    console.log("Failed to refresh logs", err);
  }
};



//   useEffect(() => {
//   const fetchSchedule = async () => {
//     try {
//       const res = await apiCall({ url: '/schedule/kid', method: 'GET' });

//       setClassList(res.schedule || []);
//     } catch (err) {
//       console.log("Failed to fetch schedule:", err);
//     }
//   };
//   fetchSchedule();
  
// }, []);

//   const markClassDone = async (classId) => {
//   try {
//     const res = await apiCall({ url: '/kid/schedule/complete', method: 'PUT', data: { classId } });
//     Alert.alert('Success', res.message);
//     // Refresh schedule
//     const updated = await apiCall({ url: '/kid/schedule/kid', method: 'GET' });
//     setClassList(updated.schedule);
//      await refreshLogs();
//   } catch (err) {
//     Alert.alert('Error', err?.response?.data?.error || 'Try during class time');
//   }
// };


  const updateMood = async mood => {
    setCurrentMood(mood);
    await apiCall({method: 'PUT', url: '/kid/update-mood', data: {mood}});
     await refreshLogs();
  };

  const fetchParentInfo = async () => {
    try {
      const res = await apiCall({method: 'GET', url: '/kid/parent-info'});
      if (res?.parent?.phoneNumber) {
        setParentInfo(res.parent);
      }
    } catch (err) {
      console.error('Failed to fetch parent info', err);
    }
  };


  useEffect(() => {
    fetchParentInfo();
  }, []);

  const callParent = () => {
    if (parentInfo?.phoneNumber) {
      Linking.openURL(`tel:${parentInfo.phoneNumber}`);
    } else {
      Alert.alert('No number', "Parent's phone number not found.");
    }
  };

  useEffect(() => {
    if (location) {
      console.log("📍 Location fetched from device:", location);
      updateLocation(location);
    }
  }, [location]);

  const updateLocation = async loc => {
    try {
      await apiCall({
        method: 'PUT',
        url: '/kid/update-location', 
        data: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      });
    } catch (err) {
      console.log('Failed to update location:', err);
    }
  };

  // const toggleEmergency = async () => {
  //   const newStatus = !isEmergencyMode;
  //   setEmergencyMode(newStatus);

  //   try {
  //      //  Just send the current location and status to emergency route
  //     const response = await apiCall({
  //       method: 'PUT',
  //       url: '/kid/emergency-with-location',
  //       data: {
  //         emergency: newStatus,
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //       },
  //     });

  //     await refreshLogs(); // <-- Add this after emergency response


  //     // console.log("🚨 Full emergency response:", response);

  //     // ✅ Step 3: Show response
  //     if (newStatus === true && response.location) {
  //       // console.log("📍 Kid Location during emergency:", response.location);
  //     }
  //   } catch (err) {
  //     console.log('Emergency update failed:', err);
  //   }
  // };

  const region = {
    latitude: location?.latitude,
    longitude: location?.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  // console.log("kid location",location );

  const MapComponent = ({location, user}) => {
    return (
      <View
        style={{
          height: 200,
          width: '100%',
          borderRadius: 15,
          overflow: 'hidden',
          marginTop: 15,
        }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{flex: 1}}
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
            anchor={{x: 0.5, y: 0.5}}>
            <View style={styles.markerContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={
                    user.profileImage
                      ? {uri: user.profileImage}
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

  const handleCheckIn = async () => {
    setIsSafe(true);
    setPlaceLocation('home');
    try {
      await apiCall({
        method: 'PUT',
        url: '/kid/check-in',
      });
      await refreshLogs();
    } catch (err) {
      console.log('Check-in failed:', err);
    }
  };

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>No User Found...</Text>
      </View>
    );
  }

   if (!location) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>No Location Found...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#FFF7ED', paddingBottom: 80}}>
      {/* Header */}
      <View style={{padding: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#4B5563'}}>
          Hi {user.fullName} 👋
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
            backgroundColor: '#FFFFFFAA',
            padding: 10,
            borderRadius: 20,
          }}>
          <MapPin size={20} color="#A78BFA" />
          <Text style={{fontSize: 16, color: '#6B7280', marginLeft: 5}}>
            {user.fullName} is at {placeLocation}
          </Text>
          <Shield size={20} color="green" style={{marginLeft: 5}} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={{paddingHorizontal: 20, marginBottom: 20}}>
        <MapComponent location={location} user={user} />

        {/* <TouchableOpacity
          // onPress={() => setEmergencyMode(!isEmergencyMode)}
          onPress={toggleEmergency}
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 20,
            backgroundColor: isEmergencyMode ? 'red' : '#FFF',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <AlertCircle size={18} color={isEmergencyMode ? '#FFF' : 'red'} />
          <Text
            style={{color: isEmergencyMode ? '#FFF' : 'red', marginLeft: 5}}>
            Emergency {isEmergencyMode ? 'Off' : 'On'}
          </Text>
        </TouchableOpacity> */}

        {/* Quick Actions */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
            marginTop: 20,
          }}>
          <TouchableOpacity
            onPress={callParent}
            style={{
              alignItems: 'center',
              width: '48%',
              padding: 15,
              backgroundColor: '#FFF',
              borderRadius: 20,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              elevation: 5,
            }}>
            <Phone size={40} color="#A78BFA" />
            <Text style={{marginTop: 5}}>Call Parent</Text>
          </TouchableOpacity>
          {!isSafe ? (
            <TouchableOpacity
              onPress={handleCheckIn}
              style={{
                alignItems: 'center',
                width: '48%',
                padding: 15,
                backgroundColor: '#A7F3D0',
                borderRadius: 20,
              }}>
              <CheckCircle2 size={40} color="green" />
              <Text style={{marginTop: 5}}>I'm Safe!</Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                alignItems: 'center',
                width: '48%',
                padding: 15,
                backgroundColor: '#D1FAE5',
                borderRadius: 20,
              }}>
              <CheckCircle2 size={40} color="gray" />
              <Text style={{marginTop: 5, color: '#6B7280'}}>Checked In</Text>
            </View>
          )}
        </View>

        {/* Mood */}
        <View
          style={{
            backgroundColor: '#FFF',
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
          }}>
          <Text style={{fontSize: 16, color: '#4B5563'}}>Mood & Updates</Text>
          <Text style={{fontSize: 18, color: '#6B7280', marginTop: 10}}>
            {user.fullName} feels {currentMood} today
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 15,
            }}>
            {['😊', '😐', '😢'].map(mood => (
              <TouchableOpacity
                key={mood}
                // onPress={() => setCurrentMood(mood)}
                onPress={() => updateMood(mood)}
                style={{
                  padding: 10,
                  borderRadius: 50,
                  backgroundColor:
                    currentMood === mood ? '#A7F3D0' : 'transparent',
                }}>
                <Text style={{fontSize: 24}}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Summary */}



  <TouchableOpacity
  onPress={() => setModalVisible(true)}
  style={{
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  }}
>
  <Text style={{ fontSize: 16, color: '#4B5563' }}>Today's Activities</Text>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
    <View style={{ alignItems: 'center' }}>
      <Activity size={40} color="#A78BFA" />
      <Text>Steps</Text>
      <Text style={{ fontWeight: 'bold' }}>In Progress</Text>
    </View>
    <View style={{ alignItems: 'center' }}>
      <School size={40} color="#A78BFA" />
      <Text>Classes</Text>
      <Text style={{ fontWeight: 'bold' }}>{classList.length}/6</Text>
    </View>
  </View>
</TouchableOpacity>



        {/* Recent Alerts */}
        {/* <View style={{backgroundColor: '#FFF', padding: 20, borderRadius: 20}}>
          <Text style={{fontSize: 16, color: '#4B5563'}}>Recent Updates</Text>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <Clock size={20} color="blue" />
            <Text style={{marginLeft: 10}}>3:45 PM - Aarav left school</Text>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <Clock size={20} color="blue" />
            <Text style={{marginLeft: 10}}>1:30 PM - Completed lunch</Text>
          </View>
        </View> */}


       <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 20 }}>
  <Text style={{ fontSize: 16, color: '#4B5563' }}>Recent Updates</Text>
  {logs.length === 0 ? (
    <Text style={{ marginTop: 10, color: 'gray' }}>No updates yet.</Text>
  ) : (
    logs.map((log, index) => (
      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Clock size={20} color="blue" />
        <Text style={{ marginLeft: 10 }}>
          {new Date(log.createdAt).toLocaleTimeString()} - {log.message}
        </Text>
      </View>
    ))
  )}
</View>



      </ScrollView>

      {/* Modal */}
      <Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
    <View style={{ backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 15 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>📘 Today's Classes</Text>
      {classList.length === 0 ? (
        <Text style={{ color: 'gray' }}>No classes scheduled yet.</Text>
      ) : (
        classList.map(cls => (
          <View key={cls._id} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '600' }}>{cls.subject}</Text>
            <Text>{cls.startTime} - {cls.endTime}</Text>
            <TouchableOpacity
              onPress={() => markClassDone(cls._id)}
              disabled={cls.completed}
              style={{
                marginTop: 5,
                padding: 8,
                backgroundColor: cls.completed ? '#ccc' : '#10B981',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white' }}>
                {cls.completed ? '✅ Done' : 'Mark as Done'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15, alignSelf: 'flex-end' }}>
        <Text style={{ color: '#3B82F6' }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* Bottom Navigation */}
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
        }}>
        <NavigationButton
          Icon={Home}
          label="Home"
          isActive={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
        />
        <NavigationButton
          Icon={Map}
          label="Journey"
          isActive={activeTab === 'journey'}
          onPress={() => setActiveTab('journey')}
        />
        {/* <NavigationButton
          Icon={Bell}
          label="Set GeoFence"
          isActive={activeTab === 'geofence'}
          onPress={() => setActiveTab('geofence')}
        /> */}

{/* 
        <NavigationButton
  Icon={Bell}
  label="Set GeoFence"
  isActive={false} // optional, unless you're tracking stack nav state
  onPress={() => navigation.navigate('GeoFence')}
/> */}

        <NavigationButton
          Icon={Users}
          label="Profile"
          isActive={activeTab === 'profile'}
          onPress={() => navigation.navigate('Modules')}
        />
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
