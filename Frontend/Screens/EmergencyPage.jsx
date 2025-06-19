import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated ,BackHandler,Alert,ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertOctagon, X, Phone, MapPin, Shield, Users, Radio } from 'lucide-react-native';
const { useNavigation } = require('@react-navigation/native');

 function EmergencyPage({ navigation }) {

  const [timer, setTimer] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [nearbyHelpers, setNearbyHelpers] = useState(0);
  const pulseAnim = new Animated.Value(1);

  // const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Back Navigation Disabled",
        "Please use the on-screen button to navigate.",
        [{ text: "OK" }]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    let interval;
    
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      navigation.navigate('EmergencyInfo');
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => {
        setNearbyHelpers(3);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleCancel = () => {
    setIsActive(false);
    setTimer(15);
    setNearbyHelpers(0);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
          >
            <X color="white" size={24} />
          </TouchableOpacity>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <AlertOctagon color="white" size={64} />
          </Animated.View>
          <Text style={styles.title}>Emergency Alert Activated</Text>
          <Text style={styles.subtitle}>Help is on the way. Stay calm and stay safe.</Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Authorities will be notified in</Text>
          <Text style={styles.timer}>{timer} seconds</Text>
        </View>

        {/* Nearby Helpers Alert */}
        <View style={styles.helpersContainer}>
          <View style={styles.helpersHeader}>
            <View style={styles.row}>
              <Users color="#7157e4" size={24} />
              <Text style={styles.helperText}>Nearby Verified Users</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{nearbyHelpers} found</Text>
            </View>
          </View>
          <View style={styles.broadcastRow}>
            <Radio color="#7157e4" size={16} />
            <Text style={styles.broadcastText}>
              Broadcasting your location to nearby verified users
            </Text>
          </View>
        </View>

        {/* Status Information */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <MapPin color="#7157e4" size={24} />
            <View>
              <Text style={styles.statusTitle}>Sharing your live location</Text>
              <Text style={styles.statusSubtext}>Verified users can track your location</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Phone color="#7157e4" size={24} />
            <View>
              <Text style={styles.statusTitle}>Emergency contacts notified</Text>
              <Text style={styles.statusSubtext}>SMS and app notifications sent</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Shield color="#7157e4" size={24} />
            <View>
              <Text style={styles.statusTitle}>Police assistance requested</Text>
              <Text style={styles.statusSubtext}>Emergency services alerted</Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <X color="#7157e4" size={20} />
            <Text style={styles.cancelButtonText}>Cancel Emergency Alert</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Tips */}
      <View style={styles.safetyTips}>
        <Text style={styles.safetyText}>Stay in a safe location until help arrives</Text>
        <Text style={styles.alertText}>Nearby verified users have been alerted</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: '#7157e4',
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 14,
  },
  timerContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7157e4',
  },
  helpersContainer: {
    padding: 24,
    backgroundColor: '#f8f5ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  helpersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helperText: {
    color: '#333',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#7157e4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  broadcastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  broadcastText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    padding: 24,
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    color: '#333',
    fontSize: 16,
  },
  statusSubtext: {
    color: '#666',
    fontSize: 14,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: '#E8E8E8',
  },
  cancelButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7157e4',
    gap: 8,
  },
  cancelButtonText: {
    color: '#7157e4',
    fontSize: 16,
    fontWeight: '600',
  },
  safetyTips: {
    marginTop: 16,
    alignItems: 'center',
  },
  safetyText: {
    fontSize: 14,
    color: '#666',
  },
  alertText: {
    marginTop: 4,
    fontSize: 14,
    color: '#7157e4',
  },
});

module.exports = EmergencyPage;