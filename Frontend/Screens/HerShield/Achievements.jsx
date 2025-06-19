const React = require('react');
const {useState,useRef,useEffect} = require('react');
const { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions,Animated } = require('react-native');
const { useNavigation } = require('@react-navigation/native');
const Ionicons = require('react-native-vector-icons/Ionicons').default;
const Share = require('react-native-share');
const Footer = require('../../Components/Footer')
const BackendUri = process.env.BACKEND_URI;
const axios = require('axios').default;
const defaultMaleImage = require('../..//assets/male.png');
const defaultFemaleImage = require('../../assets/female.png');


const achievementsData = [
  { id: '1', title: 'Safety Star', description: 'Awarded for 10 safe activities' ,img:""},
  { id: '2', title: 'Network Builder', description: 'Invited 10 people to the network' ,img:""},
  { id: '3', title: 'Guardian of the Month', description: 'Awarded in July 2023' ,img:""},
  { id: '4', title: 'Loyal Supporter', description: '3 months of involvement',img:"" },
  { id: '5', title: 'Active Rescuer', description: 'Responded to 10 emergencies',img:"" },
];


function Achievements ({ navigation ,route}) {

  const [achievements, setAchievements] = useState(achievementsData);
  const {user} = route.params;
  console.log("user",user)
  const onShare = async () => {
    try {
      console.log("Sharing...");
      const shareOptions = {
        message: 'Check out my achievements in the app!',
      };
      
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing content: ', error.message);
    }
  };

  const getAchievements = async (user) => {
    if (!user || !user._id) {
      console.warn("User data is missing or invalid");
      return;
    }
  
    try {
      const response = await axios.get(`${BackendUri}/users/achievements/${user._id}`);
      console.log("response",response.data.data)
      const newAchievements = response.data.data.map(achievement => achievement.achievementId);
      console.log("achievements",newAchievements)
setAchievements(newAchievements);
} catch (error) {
  console.error('Error fetching achievements: ', error.message);

      }
  };
  
  useEffect(() => {
    getAchievements(user);
  }, [user]); // Add `user` as a dependency
  

  if(achievements.length === 0){
    return(
      <>
      <View style={styles.container}>
        {/* Profile Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AchievementsForm')}> 
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={() => onShare}>
          <Ionicons name="share-social-outline" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <View style={styles.longLine}>
            <Text style={styles.achievedAchievements}>{achievements.length}</Text>
            <View style={styles.ImageOuterCircle}>
              <View style={styles.ImageInnerCircle}>
                <Image source={user.gender === 'Male' ? defaultMaleImage : defaultFemaleImage} style={styles.profileImage} />
              </View> 
            </View>
            <Text style={styles.availableAchievements}>100</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <View style={styles.noAchievementsContainer}>
            <Text style={styles.noAchievementsText}>No Achievements</Text>
          </View>
        </View>

        {/* Footer */}
        <Footer navigation={navigation} />
      </View>
      </>
    )
  }
  return (
    <>
      <View style={styles.container}>
        {/* Profile Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AchievementsForm')}>
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={() => onShare}>
          <Ionicons name="share-social-outline" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <View style={styles.longLine}>
            <Text style={styles.achievedAchievements}>{achievements.length}</Text>
            <View style={styles.ImageOuterCircle}>
              <View style={styles.ImageInnerCircle}>
                <Image source={user.gender === 'Male' ? defaultMaleImage : defaultFemaleImage} style={styles.profileImage} />
              </View>
            </View>
            <Text style={styles.availableAchievements}>100</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <FlatList
            data={achievements}
            renderItem={({ item }) => <AchievementCard title={item.title} description={item.description} img={item.img} />}
            contentContainerStyle={styles.achievementsCardsContainer}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.achievementsFooter}>
          <Text style={styles.achievementsFooterText}>ACHIEVEMENTS</Text>
        </View>

    <Footer display={false}/>
      </View>
    </>
  );
};

const AchievementCard = ({ title, description,img }) => {
  const [flipped, setFlipped] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const toValue = flipped ? 0 : 1;

    Animated.timing(rotateAnim, {
      toValue,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const frontInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={0.8}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.achievementCard, { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }]}>
          <View style={styles.trophyContainer}>
            <Image source={{ uri: `${BackendUri}/${img.replace(/\\/g, '/')}`  || require('../../assets/trophy.png')}}  style={styles.trophyImage} />
          </View>
          <Text style={styles.achievementTitle}>{title}</Text>
        </Animated.View>

        <Animated.View style={[styles.achievementCard, styles.backCard, { transform: [{ rotateY: backInterpolate }], opacity: backOpacity }]}>
         <View style={styles.descriptionContainer}>
          <Text style={styles.achievementDescription}>{description}</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    

    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descriptionContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  cardContainer:{
    width: 150,
    height: 180,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    perspective: 1000,
    
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
    backgroundColor: '#D7D0FF',
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
    backgroundColor: '#beb4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ImageInnerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f1f0f7',
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
    // justifyContent: 'center',
  },
  achievementCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden', // Hides the back when front is visible
    borderRadius: 15,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#E0D7B5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  trophyContainer: {
    height: "70%",
    width: '100%',
    backgroundColor: '#F7F1E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    
  },
  trophyImage: {
    height: "80%",
    width: "80%",
    backgroundColor: 'transparent', 
    resizeMode: 'contain',
   
  },
  achievementDetails: {
    height: "30%",
    alignItems: 'center',
    padding: 10,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    // margin:'auto',

    textAlign: 'center',
    color: '#2C3E50',
    // justifyContent:'center',
    // alignItems:'center',
    // margin:'auto'

    marginTop: 10,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#616161',
    paddingHorizontal: 10,
    // justifyContent:'center'
    // alignItems:'center'
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
  backCard: {
    backgroundColor: '#D6C3FC',
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  noAchievementsContainer: {
    flex: 1,
    margin:"auto",
  },
  noAchievementsText: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1B3A4B',
  },
});

module.exports = Achievements;
