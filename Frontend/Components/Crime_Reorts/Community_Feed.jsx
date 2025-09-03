const React = require("react")
const { useState } = React
const {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} = require("react-native")
const Icon = require("react-native-vector-icons/Feather").default

console.log("Icon", Icon)

function CommunityFeedPage({ onBack, onReportCrime }) {
  const [viewMode, setViewMode] = useState("list") // "map" | "list"

  const mockReports = [
    {
      id: 1,
      type: "harassment",
      title: "Street Harassment",
      location: "Downtown Area",
      time: "2 hours ago",
      description: "Inappropriate comments made by stranger",
      status: "verified",
      distance: "0.3 miles",
    },
    {
      id: 2,
      type: "theft",
      title: "Purse Snatching",
      location: "Park Avenue",
      time: "5 hours ago",
      description: "Bag stolen while walking",
      status: "pending",
      distance: "0.7 miles",
    },
    {
      id: 3,
      type: "stalking",
      title: "Following Incident",
      location: "Shopping District",
      time: "1 day ago",
      description: "Person followed for several blocks",
      status: "verified",
      distance: "1.2 miles",
    },
  ]

  const crimeIcons = {
    harassment: "alert-triangle",
    theft: "truck",
    assault: "shield",
    stalking: "eye",
    other: "user-x",
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <Icon name="arrow-left" size={20} color="#7157E4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Feed</Text>
          <TouchableOpacity onPress={onReportCrime} style={styles.reportBtn}>
            <Icon name="plus" size={16} color="#FFF" />
            <Text style={styles.reportBtnText}> Report</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            style={[
              styles.toggleBtn,
              viewMode === "list" ? styles.toggleActive : styles.toggleInactive,
            ]}
          >
            <Icon name="list" size={16} color={viewMode === "list" ? "#FFF" : "#7157E4"} />
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === "list" ? "#FFF" : "#7157E4" },
              ]}
            >
              {" "}
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("map")}
            style={[
              styles.toggleBtn,
              viewMode === "map" ? styles.toggleActive : styles.toggleInactive,
            ]}
          >
            <Icon name="map" size={16} color={viewMode === "map" ? "#FFF" : "#7157E4"} />
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === "map" ? "#FFF" : "#7157E4" },
              ]}
            >
              {" "}
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {viewMode === "map" ? (
          <View style={styles.card}>
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
              <View style={styles.mapIconContainer}>
                <Icon name="map" size={28} color="#7157E4" />
              </View>
              <Text style={styles.mapTitle}>Interactive Map View</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendDotGreen} />
                <Text style={styles.legendText}>Verified reports</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendDotOrange} />
                <Text style={styles.legendText}>Pending verification</Text>
              </View>
            </View>
          </View>
        ) : (
          mockReports.map((report) => (
            <View key={report.id} style={styles.card}>
              <View style={styles.reportRow}>
                <View style={styles.iconBox}>
                  <Icon
                    name={crimeIcons[report.type] || "alert-circle"}
                    size={18}
                    color="#7157E4"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    {report.status === "verified" ? (
                      <View style={styles.badgeGreen}>
                        <Icon name="check-circle" size={12} color="#FFF" />
                        <Text style={styles.badgeText}> Verified</Text>
                      </View>
                    ) : (
                      <View style={styles.badgeOrange}>
                        <Icon name="clock" size={12} color="#FFF" />
                        <Text style={styles.badgeText}> Pending</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reportMeta}>
                    {report.location} • {report.distance} • {report.time}
                  </Text>
                  <Text style={styles.reportDesc}>{report.description}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity onPress={onReportCrime} style={styles.fab}>
        <Icon name="plus" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Only verified reports from trusted users are shown to prevent misinformation.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8E8E8" },
  header: { backgroundColor: "#FFF", padding: 16, paddingTop: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1D1D1D" },
  reportBtn: {
    flexDirection: "row",
    backgroundColor: "#7157E4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  reportBtnText: { color: "#FFF", fontSize: 14 },
  toggleRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  toggleBtn: { flex: 1, flexDirection: "row", justifyContent: "center", padding: 8, borderRadius: 12 },
  toggleActive: { backgroundColor: "#7157E4" },
  toggleInactive: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D7D0FF" },
  toggleText: { fontSize: 14, fontWeight: "500" },
  content: { padding: 16 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  reportRow: { flexDirection: "row", gap: 12 },
  iconBox: { backgroundColor: "#D7D0FF", padding: 10, borderRadius: 12 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reportTitle: { fontWeight: "bold", fontSize: 15, color: "#1D1D1D" },
  badgeGreen: { flexDirection: "row", backgroundColor: "#2ECC71", padding: 4, borderRadius: 12 },
  badgeOrange: { flexDirection: "row", backgroundColor: "#F39C12", padding: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, color: "#FFF" },
  reportMeta: { fontSize: 12, color: "#555", marginVertical: 2 },
  reportDesc: { fontSize: 13, color: "#1D1D1D" },
  mapIconContainer: { backgroundColor: "#D7D0FF", padding: 16, borderRadius: 40, marginBottom: 12 },
  mapTitle: { fontWeight: "600", fontSize: 16, color: "#1D1D1D", marginBottom: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  legendDotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2ECC71", marginRight: 6 },
  legendDotOrange: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#F39C12", marginRight: 6 },
  legendText: { fontSize: 12, color: "#555" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#7157E4",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  footer: { padding: 12, alignItems: "center" },
  footerText: { fontSize: 11, color: "#555", textAlign: "center" },
})

module.exports = CommunityFeedPage
