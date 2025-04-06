const React = require('react');
const { View, Text, StyleSheet, Image, TouchableOpacity, FlatList ,Dimensions} = require('react-native');
const { useNavigation } = require('@react-navigation/native');
const Ionicons = require('react-native-vector-icons/Ionicons');
const Share = require('react-native-share');
const achievementsData = [
    { id: '1', title: 'Safety Star', description: 'Awarded for 10 safe activities' },
    { id: '2', title: 'Network Builder', description: 'Invited 10 people to the network' },
    { id: '3', title: 'Guardian of the Month', description: 'Awarded in July 2023' },
    { id: '4', title: 'Loyal Supporter', description: '3 months of involvement' },
    { id: '5', title: 'Active Rescuer', description: 'Responded to 10 emergencies' },
  ];

  const defaultMaleImage = require('../assets/male.png');
  const defaultFemaleImage = require('../assets/female.png');
const Footer = require('../Components/Footer');

function AchievementsScreen({ navigation,route }) {
    const {user} = route.params;
      const onShare = async () => {
        try {
          const shareOptions = {
            message: 'Check out my achievements in the app!',
          };
          await Share.open(shareOptions);
        } catch (error) {
          console.error('Error sharing content: ', error.message);
        }
      };

return(
   <View style={styles.container}>
           {/* Profile Header */}
           {/* <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AchievementsForm')}>
             <Text>Add</Text>
           </TouchableOpacity> */}
           

            <View style={styles.profileHeader}>
                     <View style={styles.longLine}>
                       <Text style={styles.achievedAchievements}>5</Text>
                       <View style={styles.ImageOuterCircle}>
                         <View style={styles.ImageInnerCircle}>
                           <Image source={user.gender === 'Male' ? defaultMaleImage : defaultFemaleImage} style={styles.profileImage} />
                         </View>
                       </View>
                       <Text style={styles.availableAchievements}>100</Text>
                     </View>
             </View>


                    <View style={styles.achievementsContainer}>
                       <FlatList
                         data={achievementsData}
                         renderItem={({ item }) => <AchievementCard title={item.title} description={item.description} />}
                         contentContainerStyle={styles.achievementsCardsContainer}
                         keyExtractor={item => item.id}
                         numColumns={2}
                         showsVerticalScrollIndicator={false}
                       />
                     </View>
                     <View style={styles.achievementsFooter}>
          <Text style={styles.achievementsFooterText}>ACHIEVEMENTS</Text>
        </View>
    </View>
)
}

const AchievementCard = ({ title, description }) => (
  <View style={styles.achievementCard}>
    <View style={styles.trophyContainer}>
      <Image source={require('../assets/trophy.png')} style={styles.trophyImage} />
    </View>
    <View style={styles.achievementDetails}>
      <Text style={styles.achievementTitle}>{title}</Text>
      <Text style={styles.achievementDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F0F0',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
    },
    addButton: {
      position: 'absolute',
      top: 40,
      left: 80,
    },
    shareButton: {
      position: 'absolute',
      top: 40,
      right: 20,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 40,
      paddingVertical: 20,
    },
    longLine: {
      width: '100%',
      marginTop: 15,
      height: 65,
      backgroundColor: '#C0C0C0',
      borderRadius: 40,
      justifyContent: 'center',
    },
    achievedAchievements: {
      fontSize: 40,
      color: '#1B3A4B',
      fontWeight: 'bold',
      position: 'absolute',
      left: '15%',
    },
    availableAchievements: {
      fontSize: 40,
      color: '#1B3A4B',
      fontWeight: 'bold',
      position: 'absolute',
      right: '10%',
    },
    ImageOuterCircle: {
      position: 'absolute',
      left: Dimensions.get('window').width / 2 - 60,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#C0C0C0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ImageInnerCircle: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: '#D9D9D9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileImage: {
      width: '90%',
      height: '90%',
      borderRadius: 30,
    },
    achievementsContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    achievementsCardsContainer: {
      justifyContent: 'center',
    },
    achievementCard: {
      backgroundColor: '#E0D7B5',
      width: '45%',
      margin: 10,
      borderRadius: 15,
      alignItems: 'center',
      height: 180,
    },
    trophyContainer: {
      height: 80,
      width: '100%',
      backgroundColor: '#F0E68C',
      alignItems: 'center',
      justifyContent: 'center',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    trophyImage: {
      height: 50,
      width: 50,
    },
    achievementDetails: {
      alignItems: 'center',
      padding: 10,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      textAlign: 'center',
    },
    achievementDescription: {
      fontSize: 12,
      textAlign: 'center',
    },
    achievementsFooter: {
      backgroundColor: '#C0C0C0',
      width: '100%',
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    achievementsFooterText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1B3A4B',
    },
  });
module.exports = AchievementsScreen;