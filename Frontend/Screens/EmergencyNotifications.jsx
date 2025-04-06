const React = require('react');
const { useState,useEffect } = require('react');
const { View, Text,ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } = require('react-native');
const Footer = require('../Components/Footer');

const initialNotifications = [
  { id: '1', message: 'In Agripada 150 meters (10 min walking distance)', time: '1 min ago', details: 'Emergency in Agripada 150 meters. Address: 3rd Ghelabai Street, Khadija Tower, Madan Pura, Mumbai - 400008.' },
  { id: '2', message: 'In Byculla 250 meters (17 min walking distance)', time: '5 min ago', details: 'Emergency in Byculla 250 meters. Address: 4th Ghelabai Street, Khadija Tower, Madan Pura, Mumbai - 400008.' },
  { id: '3', message: 'In Koramangala 350 meters (25 min walking distance)', time: '3 min ago', details: 'Emergency in Koramangala 350 meters. Address: 5th Ghelabai Street, Khadija Tower, Madan Pura, Mumbai - 400008.' },
];

const EmergencyNotifications = () => {
  const [isReady, setIsReady] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      // Simulate a font loading delay (optional)
      setTimeout(() => {
        setIsReady(true);
      }, 1000);
    };
    loadResources();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1B3A4B" />
      </View>
    );
  }

  const handleDetail = (notification) => setSelectedNotification(notification);
  const handleBack = () => setSelectedNotification(null);
  const handleReject = (id) => setNotifications(notifications.filter(n => n.id !== id));
  const handleAccept = () => {
    if (selectedNotification) {
      console.log('Accepted emergency:', selectedNotification.message);
      handleReject(selectedNotification.id);
      setSelectedNotification(null);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {selectedNotification ? (
          <>
            <TouchableOpacity style={styles.backButtonContainer} onPress={handleBack}>
              <Image source={require('./../assets/back.png')} style={styles.backButton} />
            </TouchableOpacity>
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationText}>{selectedNotification.message}</Text>
              <Text style={styles.notificationTextTime}>{selectedNotification.time}</Text>
              <Text style={styles.detailsText}>{selectedNotification.details}</Text>
              <TouchableOpacity style={styles.buttonAccept} onPress={handleAccept}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Emergency Notifications</Text>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.notificationContainer}>
                  <Text style={styles.notificationText}>{item.message}</Text>
                  <Text style={styles.notificationTextTime}>{item.time}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonDetail} onPress={() => handleDetail(item)}>
                      <Text style={styles.buttonText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonReject} onPress={() => handleReject(item.id)}>
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </>
        )}
      </View>
      <Footer display={false} page="EmergencyNotifications" />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#D7D0FF', alignItems: 'center' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D7D0FF' },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 10, color: 'white' },
  backButtonContainer: { position: 'absolute', top: 40, left: 15 },
  backButton: { width: 25, height: 25, resizeMode: 'contain' },
  notificationContainer: { padding: 15, marginVertical: 5, borderRadius: 10, backgroundColor: '#F1F1F1', borderColor: '#1B3A4B', borderWidth: 1 },
  notificationText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1B3A4B' },
  notificationTextTime: { fontSize: 16, marginTop: 10, fontWeight: '500', textAlign: 'right', color: '#1B3A4B' },
  detailsText: { fontSize: 16, marginTop: 10, fontWeight: '500', textAlign: 'center', color: '#333' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  buttonDetail: { backgroundColor: '#4EEF49', padding: 10, borderRadius: 20, flex: 0.45 },
  buttonReject: { backgroundColor: '#F44336', padding: 10, borderRadius: 20, flex: 0.45 },
  buttonAccept: { backgroundColor: '#7EEF49', padding: 10, borderRadius: 20, marginTop: 50 },
  buttonText: { textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold' },
});

module.exports = EmergencyNotifications;
