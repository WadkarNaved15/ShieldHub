const React = require("react")
const { View, Text, TouchableOpacity, StyleSheet } = require("react-native")
const Icon = require("react-native-vector-icons/Feather") // using Feather (lucide equivalent)

function ThankYouPage({ onReturnHome, sharedWithCommunity }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Success Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Icon name="check-circle" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* Main Message */}
        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.subtitle}>Your report has been submitted.</Text>
        <Text style={styles.helperText}>This helps improve safety in your area.</Text>

        {/* Status Info */}
        <View style={styles.statusBox}>
          {sharedWithCommunity ? (
            <View style={styles.statusRow}>
              <Icon name="users" size={20} color="#7157E4" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statusTitle}>Shared with Community</Text>
                <Text style={styles.statusDetail}>
                  Your report will appear on the community feed after verification
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.statusTitle}>Private Report Submitted</Text>
              <Text style={styles.statusDetail}>
                Your data helps improve our safety algorithms while staying private
              </Text>
            </View>
          )}
        </View>

        {/* Return Home Button */}
        <TouchableOpacity style={styles.button} onPress={onReturnHome}>
          <Icon name="home" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your safety matters. If this is an emergency, please contact local authorities immediately.
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
  },
  iconWrapper: { marginBottom: 16 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2ECC71",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1D1D1D", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#1D1D1D", marginBottom: 6 },
  helperText: { fontSize: 13, color: "#555555", marginBottom: 20 },
  statusBox: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#D7D0FF",
    marginBottom: 24,
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusTitle: { fontSize: 14, fontWeight: "600", color: "#1D1D1D" },
  statusDetail: { fontSize: 12, color: "#555555" },
  centered: { alignItems: "center" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7157E4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    marginTop: 16,
    paddingTop: 12,
  },
  footerText: { fontSize: 11, color: "#555555", textAlign: "center" },
})

module.exports = ThankYouPage
