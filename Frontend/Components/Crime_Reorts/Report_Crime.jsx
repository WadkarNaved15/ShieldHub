const React = require("react")
const { useState } = React
const {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView
} = require("react-native")

function ReportCrimePage({ onSubmit, onViewCommunity }) {
  const [formData, setFormData] = useState({
    incidentType: "",
    location: "Current Location (Auto-detected)",
    description: "",
    media: null,
    shareWithCommunity: false,
    reportAnonymously: true,
  })

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HerShield</Text>
        <Text style={styles.headerSubtitle}>Report Crime</Text>
      </View>

      {/* Community Feed Button */}
      <TouchableOpacity style={styles.communityBtn} onPress={onViewCommunity}>
        <Text style={styles.communityBtnText}>Community Feed</Text>
      </TouchableOpacity>

      {/* Incident Type */}
      <View style={styles.card}>
        <Text style={styles.label}>Incident Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="Type of incident (e.g. Harassment)"
          value={formData.incidentType}
          onChangeText={(val) => setFormData({ ...formData, incidentType: val })}
        />
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.locationBox}>{formData.location}</Text>
        <View style={styles.mapPreview}>
          <Text style={styles.mapText}>Map Preview (Tap to adjust pin)</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Describe what happened..."
          value={formData.description}
          onChangeText={(val) => setFormData({ ...formData, description: val })}
        />
      </View>

      {/* Privacy */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Report Anonymously</Text>
            <Text style={styles.switchSub}>Hide your identity</Text>
          </View>
          <Switch
            value={formData.reportAnonymously}
            onValueChange={(val) => setFormData({ ...formData, reportAnonymously: val })}
          />
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Share with Community</Text>
            <Text style={styles.switchSub}>Visible on community feed</Text>
          </View>
          <Switch
            value={formData.shareWithCommunity}
            onValueChange={(val) => setFormData({ ...formData, shareWithCommunity: val })}
          />
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>

      {/* Info */}
      <Text style={styles.infoNote}>
        All reports help improve safety data and crime hotspot detection, regardless of sharing preference.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8E8E8", padding: 16 },
  header: { alignItems: "center", marginVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#7157E4" },
  headerSubtitle: { fontSize: 16, color: "#555" },
  communityBtn: {
    borderWidth: 2,
    borderColor: "#7157E4",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  communityBtnText: { color: "#7157E4", fontWeight: "600" },
  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 16, marginBottom: 16 },
  label: { fontWeight: "600", color: "#1D1D1D", marginBottom: 8 },
  input: {
    borderWidth: 2,
    borderColor: "#D7D0FF",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFF",
  },
  textArea: {
    borderWidth: 2,
    borderColor: "#D7D0FF",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFF",
    height: 100,
    textAlignVertical: "top",
  },
  locationBox: {
    backgroundColor: "#D7D0FF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  mapPreview: {
    backgroundColor: "#E8E8E8",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  mapText: { color: "#555" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  switchTitle: { fontWeight: "600", color: "#1D1D1D" },
  switchSub: { color: "#555", fontSize: 12 },
  submitBtn: {
    backgroundColor: "#7157E4",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  submitText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  infoNote: { fontSize: 12, color: "#555", textAlign: "center", marginBottom: 30 },
})

module.exports = ReportCrimePage
