const React = require("react")
const { useState } = React
const { StyleSheet, View } = require("react-native")

const ReportCrimePage = require("../../Components/Crime_Reorts/Report_Crime")
const CommunityFeedPage = require("../../Components/Crime_Reorts/Community_Feed")
const ThankYouPage = require("../../Components/Crime_Reorts/Thankyou_Page")

console.log("Pages", ReportCrimePage, CommunityFeedPage, ThankYouPage)
function Crime_Reports() {
  const [currentPage, setCurrentPage] = useState("community") // "report" | "community" | "thankyou"
  const [reportData, setReportData] = useState(null)

  const handleReportSubmit = (data) => {
    setReportData(data)
    setCurrentPage("thankyou")
  }

  const handleViewCommunity = () => {
    setCurrentPage("community")
  }

  const handleBackToReport = () => {
    setCurrentPage("report")
  }

  const handleReportCrime = () => {
    setCurrentPage("report")
  }

  return (
    <View style={styles.container}>
      {currentPage === "report" && (
        <ReportCrimePage onSubmit={handleReportSubmit} onViewCommunity={handleViewCommunity} />
      )}
      {currentPage === "community" && (
        <CommunityFeedPage onBack={handleBackToReport} onReportCrime={handleReportCrime} />
      )}
      {currentPage === "thankyou" && (
        <ThankYouPage
          onReturnHome={handleBackToReport}
          sharedWithCommunity={reportData?.shareWithCommunity}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8E8", // HerShield background color
  },
})

module.exports = Crime_Reports
