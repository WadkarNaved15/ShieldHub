const React = require('react');
const { useState, useEffect } = React;
const { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Animated, 
  Platform,
  Image,
  Easing ,Alert,NativeModules
} = require('react-native');
// const { Mic, ArrowLeft, Settings } = require('lucide-react-native');
const { Picker } = require("@react-native-picker/picker");
const { useNavigation } = require("@react-navigation/native");
const Footer = require("../../Components/Footer");
const apiCall = require("../../functions/axios");
const AudioRecord = require("react-native-audio-record").default;
const { startBackgroundService, stopBackgroundService, getSocket } = require("../../services/socketServices");
const {DeviceEventEmitter} = require("react-native")
const Loader = require("../../Components/Loader");

console.log("loader", Loader);

const FeelingUnsafe = () => {
  const [isActive, setIsActive] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(5);
  const [customTime, setCustomTime] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [pinStaus, setPinStatus] = useState(null);
  const pulseAnim = new Animated.Value(1);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  let audioListener = null;



  function getBestAudioSource() {
    if (Platform.OS === 'android' && NativeModules.AudioRecord) {
      try {
        // Attempt to use VOICE_RECOGNITION (6)
        AudioRecord.init({
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6, // Try VOICE_RECOGNITION first
        });
        console.log("✅ Using VOICE_RECOGNITION (6)");
        return 6;
      } catch (error) {
        console.warn("⚠️ VOICE_RECOGNITION not supported, falling back to MIC (1)");
      }
    }
    return 1; // Default to MIC
  }

useEffect(() => {
  setLoading(true);

  apiCall({
    method: "GET",
    url: "/FeelingUnsafe",
  })
    .then((response) => {
      console.log("Feeling Unsafe Status Response:", response);
      setIsActive(response?.session?.active);
      setTimer((response?.session?.interval || 0) * 60);
      setSelectedInterval(response?.session?.interval?.toString() || "5"); // fallback
    })
    .catch((error) => {
      console.error("Failed to check Feeling Unsafe status:", error);
    })
    .finally(() => {
      setLoading(false); // ✅ ensures loader stops only after response/error
    });
}, []);



  const startRecording = async () => {
    console.log("Audio Record", AudioRecord);
    const socket = getSocket();
    if (!socket) return;

    const bestAudioSource = getBestAudioSource();
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: bestAudioSource,
    });

    
    console.log("🎙️ Starting Emergency Audio Streaming...");
    AudioRecord.start();

    // Send audio data continuously to the server
    audioListener = AudioRecord.on("data", (data) => {
      socket.emit("audio_data", data);
    });
  };

  const stopRecording = async () => {
    if (audioListener) {
      audioListener.remove();
      audioListener = null;
    }
    await AudioRecord.stop();
    console.log("🎙️ Stopped Audio Streaming.");
  };

  const startFeelingUnsafe = async () => {
    try {
      const response = await apiCall({
        method: "POST",
        url: "/FeelingUnsafe/startFeelingUnsafe",
        data: { interval: parseInt(selectedInterval) },
      });

      if (response.status === 200) {
        setIsActive(true);
        setTimer(selectedInterval * 60);
        await startBackgroundService(); // 🚀 Start Background WebSocket
        await startRecording(); // 🎙 Start Recording Audio
        startPulseAnimation();
        console.log("✅ Feeling Unsafe Mode Activated");
      }
    } catch (error) {
      console.error("❌ Failed to start Feeling Unsafe mode:", error);
    }
  };
  const isFirstRender = React.useRef(true); // Track initial render

// useEffect(() => {
//   if (isFirstRender.current) {
//     console.log("🔄 Skipping first render effect");
//     isFirstRender.current = false; // Mark as initialized
//     return; // 🚀 Skip the first execution
//   }

//   apiCall({
//     method: "POST",
//     url: "/FeelingUnsafe/updateFeelingUnsafe",
//     data: { interval: parseInt(selectedInterval) },
//   }).catch((error) => console.error("❌ Failed to update interval:", error));
//   setTimer(parseInt(selectedInterval) * 60);
// }, [selectedInterval]);

const updateInterval = async (interval) => {
  try {
    await apiCall({
      method: "POST",
      url: "/FeelingUnsafe/updateFeelingUnsafe",
      data: { interval },
    });
    setSelectedInterval(interval);
    setTimer(interval * 60);
    console.log("✅ Interval updated:", interval);
  } catch (error) {
    console.error("❌ Failed to update interval:", error);
  }
};

const stopFeelingUnsafe = async () => {
  Alert.alert(
    "Abort",
    "Are you sure you want to turn off the Feeling Unsafe mode?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await apiCall({
              method: "POST",
              url: "/FeelingUnsafe/stopFeelingUnsafe",
            });

            // 1️⃣ Stop Recording First
            await stopRecording(); // ⛔ Ensure audio stops first

            // 2️⃣ Stop Background WebSocket Service
            await stopBackgroundService(); // ⛔ Stop background service
            stopPulseAnimation();
            // 3️⃣ Close WebSocket Connection
            const socket = getSocket();
            if (socket) {
              socket.disconnect();
              console.log("🛑 WebSocket Disconnected");
            }

            // 4️⃣ Update UI State
            setIsActive(false);
            console.log("✅ Feeling Unsafe Mode Deactivated");

            // 5️⃣ Navigate Back
            navigation.goBack();
          } catch (error) {
            console.error("❌ Failed to stop Feeling Unsafe mode:", error);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


console.log("Timer", timer, "Selected Interval", selectedInterval, "Is Active", isActive);

useEffect(() => {
  let interval;
  if (isActive && timer > 0) {
    interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
  } else if (!isActive) {
    setTimer(selectedInterval * 60); // Reset timer when stopping "Feeling Unsafe"
  }
  return () => clearInterval(interval);
}, [isActive, timer]);
  // Function to format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to handle activation
 

// useEffect(() => {
//   if (isActive) {
//     console.log("🔔 Listening for events...");

//     DeviceEventEmitter.removeAllListeners("pinStatus");
//     DeviceEventEmitter.addListener("pinStatus", (data) => {
//       console.log("📌 Received PIN status:", data);
//       setPinStatus(data.message);
//     });

//     DeviceEventEmitter.removeAllListeners("sos_triggered");
//     DeviceEventEmitter.addListener("sos_triggered", () => {
//       console.log("🚨 SOS Triggered");
//     });

//   } else {
//     console.log("🛑 Removing event listeners...");
//     DeviceEventEmitter.removeAllListeners("pinStatus");
//     DeviceEventEmitter.removeAllListeners("sos_triggered");
//   }

//   return () => {
//     console.log("🛑 Cleanup event listeners...");
//     DeviceEventEmitter.removeAllListeners("pinStatus");
//     DeviceEventEmitter.removeAllListeners("sos_triggered");
//   };
// }, [isActive]);

  
  // Setup pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
  };

  if(loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Image source={require('../../assets/back.png')} style={{ width: 24, height: 24 }}></Image>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feeling Unsafe</Text>
        <TouchableOpacity style={styles.iconButton}>
          {/* <Settings size={24} color="#BDBDBD" /> */}
        </TouchableOpacity>
      </View>

      {/* Microphone Section */}
      <View style={styles.microphoneContainer}>
        <Animated.View 
          style={[
            styles.microphoneBackground,
            { 
              transform: [{ scale: isActive ? pulseAnim : 1 }],
              backgroundColor: isActive ? 'rgba(128, 90, 213, 0.2)' : 'transparent'
            }
          ]}
        >

          <Image source={require('../../assets/microphone.png')} style={{ width: 128, height: 128 }}></Image>
          {/* <Mic
            size={64} 
            color={isActive ? '#8050D5' : '#BDBDBD'} 
          /> */}
        </Animated.View>
      </View>

      {/* Interval Selection */}
      <View style={styles.intervalContainer}>
        <Text style={styles.intervalText}>Set your check-in intervals</Text>
        
        <TouchableOpacity 
          style={styles.activateButton}
          onPress={isActive ? stopFeelingUnsafe : startFeelingUnsafe}
        >
          <Text style={styles.activateButtonText}>{isActive ? 'Stop Feeling Unsafe' : 'Activate Feeling Unsafe'}</Text>
        </TouchableOpacity>

        <Text style={styles.timerLabel}>Time until next call-in:</Text>
        <Text style={styles.timerValue}>{formatTime(timer)}</Text>
        <View style={styles.intervalButtonsRow}>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              selectedInterval === 1 ? styles.intervalButtonSelected : null
            ]}
            onPress={() => updateInterval(1)}
          >
            <Text style={selectedInterval === 1 ? styles.intervalButtonTextSelected : styles.intervalButtonText}>
              1 min
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.intervalButton,
              selectedInterval === 3 ? styles.intervalButtonSelected : null
            ]}
            onPress={() => updateInterval(3)}
          >
            <Text style={selectedInterval === 3 ? styles.intervalButtonTextSelected : styles.intervalButtonText}>
              3 mins
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.intervalButtonsRow}>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              selectedInterval === 5 ? styles.intervalButtonSelected : null
            ]}
            onPress={() => updateInterval(5)}
          >
            <Text style={selectedInterval === 5 ? styles.intervalButtonTextSelected : styles.intervalButtonText}>
              5 mins
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.intervalButton,
              selectedInterval === 10 ? styles.intervalButtonSelected : null
            ]}
            onPress={() => updateInterval(10)}
          >
            <Text style={selectedInterval === 10 ? styles.intervalButtonTextSelected : styles.intervalButtonText}>
              10 mins
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.customTimeContainer}>
  <TextInput
    style={styles.customTimeInput}
    placeholder="Custom time (e.g. 7:30)"
    value={customTime}
    onChangeText={setCustomTime}
    keyboardType="numeric"
  />
<TouchableOpacity 
  style={styles.confirmButton}
  onPress={() => {
    if (!customTime) return;

    let totalMinutes = 0;
    const parts = customTime.split(":").map(Number);

    if (parts.length === 2) {
      const [mins, secs] = parts;
      if (!isNaN(mins) && !isNaN(secs)) {
        totalMinutes = mins + secs / 60;
      } else if (isNaN(mins) && !isNaN(secs)) {
        // Case: ":45" (seconds only)
        totalMinutes = secs / 60;
      }
    } else if (parts.length === 1 && !isNaN(parts[0])) {
      // Case: "7" (minutes only)
      totalMinutes = parts[0];
    }

    const interval = Math.max(1, Math.round(totalMinutes)); // at least 1 minute
    updateInterval(interval);
    setCustomTime(""); // clear after confirming
  }}
>
  <Text style={styles.confirmButtonText}>Confirm</Text>
</TouchableOpacity>
</View>


        <View style={styles.controlButtonsRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isActive ? styles.controlButtonDisabled : styles.controlButtonActivate
            ]}
            onPress={startFeelingUnsafe}
            disabled={isActive}
          >
            <Text style={isActive ? styles.controlButtonTextDisabled : styles.controlButtonTextActivate}>
              Activate
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isActive ? styles.controlButtonDisabled : styles.controlButtonDeactivate
            ]}
            onPress={stopFeelingUnsafe}
            disabled={!isActive}
          >
            <Text style={!isActive ? styles.controlButtonTextDisabled : styles.controlButtonTextDeactivate}>
              Deactivate
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isActive && (
        <Text style={styles.listeningText}>
          Listening for emergency phrase...
        </Text>
      )}
    </View>
);
};

module.exports = FeelingUnsafe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  microphoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  microphoneBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalContainer: {
    marginBottom: 16,
  },
  intervalText: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: 8,
  },
  activateButton: {
    backgroundColor: '#8050D5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  activateButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  timerLabel: {
    textAlign: 'center',
    color: '#424242',
    fontWeight: '500',
    marginBottom: 4,
  },
  timerValue: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  intervalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  intervalButtonSelected: {
    borderColor: '#8050D5',
  },
  intervalButtonText: {
    color: '#757575',
  },
  intervalButtonTextSelected: {
    color: '#8050D5',
  },
  customTimeContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  customTimeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  confirmButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#8050D5',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  controlButtonActivate: {
    backgroundColor: '#8050D5',
  },
  controlButtonDeactivate: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#8050D5',
  },
  controlButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  controlButtonTextActivate: {
    color: 'white',
    fontWeight: '500',
  },
  controlButtonTextDeactivate: {
    color: '#8050D5',
    fontWeight: '500',
  },
  controlButtonTextDisabled: {
    color: '#9E9E9E',
    fontWeight: '500',
  },
  listeningText: {
    textAlign: 'center',
    color: '#8050D5',
    marginTop: 24,
  },
});