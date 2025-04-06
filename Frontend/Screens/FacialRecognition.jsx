const React = require("react");
const { useState, useEffect, useCallback, useRef } = require("react");
const {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} = require("react-native");
const { Camera, useCameraDevices, useFrameProcessor } = require("react-native-vision-camera");
const { runOnJS } = require("react-native-reanimated");
const FaceDetection = require("@react-native-ml-kit/face-detection").default;
const RNFS = require("react-native-fs");

function FacialRecognition({ onLivenessVerified }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [motionStep, setMotionStep] = useState("Start Motion Check"); // Controls UI state
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.front;

  const requestPermissions = useCallback(async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    setHasPermission(cameraPermission === "granted");
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // 📌 Real-time face motion detection
  const frameProcessor = useFrameProcessor((frame) => {
    FaceDetection.detect(frame)
      .then((detectedFaces) => {
        if (detectedFaces.length === 0) return;

        const face = detectedFaces[0];
        console.log("Face detected:", face.headEulerAngleY);

        runOnJS(handleMotion)(face.headEulerAngleY);
      })
      .catch((error) => console.error("Face detection error:", error));
  }, []);

  // 📌 Motion step handling
  const handleMotion = (angleY) => {
    if (motionStep === "Start Motion Check") {
      setMotionStep("Turn right");
    } else if (motionStep === "Turn right" && angleY > 15) {
      setMotionStep("Turn left");
    } else if (motionStep === "Turn left" && angleY < -15) {
      setMotionStep("Face forward");
    } else if (motionStep === "Face forward" && Math.abs(angleY) < 5) {
      setMotionStep("Verified");
      Alert.alert("Liveness Verified!", "Proceeding to backend verification.");
      captureAndUpload();
    }
  };

  const captureAndUpload = async () => {
    if (!cameraRef.current) {
      Alert.alert("Camera not ready", "Please wait for the camera to initialize.");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: "quality",
        flash: "off",
        skipMetadata: true,
      });

      if (!photo?.path) {
        Alert.alert("Capture Failed", "Could not capture the image.");
        setLoading(false);
        return;
      }

      const newPath = `${RNFS.ExternalCachesDirectoryPath}/liveness.jpg`;
      await RNFS.moveFile(photo.path, newPath);
      console.log("Saved image path:", newPath);

      uploadLiveImage(newPath);
    } catch (error) {
      console.error("Face detection error:", error);
      Alert.alert("Error", "Something went wrong while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const uploadLiveImage = async (imageUri) => {
    const formData = new FormData();
    formData.append("liveImage", {
      uri: imageUri,
      type: "image/jpeg",
      name: "live_image.jpg",
    });

    try {
      const response = await fetch("https://your-backend.com/verify-liveness", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();
      if (data.isLive) {
        Alert.alert("Liveness Confirmed!", "You may proceed.");
        onLivenessVerified(imageUri);
      } else {
        Alert.alert("Liveness check failed. Try again.");
        setMotionStep("Turn right");
      }
    } catch (error) {
      console.error("Error verifying liveness:", error);
    } finally {
      await RNFS.unlink(imageUri);
      console.log("Temporary image deleted");
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        ref={cameraRef}
        frameProcessor={frameProcessor} // 👀 Real-time face tracking
        frameProcessorFps={5} // Adjust FPS for performance
      />

      <View style={styles.overlay}>
        <Text style={styles.text}>Instruction: {motionStep}</Text>
      </View>

      <View style={styles.controls}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (motionStep === "Start Motion Check") {
                setMotionStep("Turn right"); // Start motion check
              }
            }}
          >
            <Text style={styles.buttonText}>
              {motionStep === "Start Motion Check" ? "Start Motion Check" : "Processing..."}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#ffffff20",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

module.exports = FacialRecognition;
