const React = require('react');
const { View, Text, StyleSheet, Image, FlatList, Alert, Share,TouchableOpacity } = require('react-native');
const { useNavigation } = require('@react-navigation/native');
const Ionicons = require('react-native-vector-icons/Ionicons').default;
const Footer = require('../../Components/Footer');
function HerShieldHeroes({navigation}) {
  const data = [
    { id: '1', name: 'Zaman Shaikh', rank: '#1', avatar: require('../../assets/male.png') },
    { id: '2', name: 'Dilshana Sayyed', rank: '#2', avatar: require('../../assets/female.png') },
    { id: '3', name: 'Ayesha Vijapure', rank: '#3', avatar: require('../../assets/female.png') },
    { id: '4', name: 'Ovez Mustafa Khan', rank: '#4', avatar: require('../../assets/male.png') },
    { id: '5', name: 'Fatima Zainab Qureshi', rank: '#5', avatar: require('../../assets/female.png') },
    { id: '6', name: 'Radhika Samriddhi Iyer', rank: '#6', avatar: require('../../assets/female.png') },
  ];

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out my HerShield Heroes in the app!',
      });
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully!');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderHeroItem = ({ item }) => {
    let rankStyle = styles.rank;
    if (item.rank === '#1') rankStyle = styles.goldRank;
    else if (item.rank === '#2') rankStyle = styles.silverRank;
    else if (item.rank === '#3') rankStyle = styles.bronzeRank;

    return (
      <View style={styles.heroCard}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={item.avatar} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={60} color="gray" />
          )}
        </View>
        <Text style={styles.heroName}>{item.name}</Text>
        {item.rank && <Text style={rankStyle}>{item.rank}</Text>}
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black"  />
          </TouchableOpacity>
          <Text style={styles.headerText}>HerShield Heroes</Text>
          <TouchableOpacity onPress={onShare}>
            <Ionicons name="share-social-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainHeroContainer}>
          <Image source={require('../../assets/male.png')} style={styles.mainHeroAvatar} />
          <Image source={require('../../assets/golden-award-laurel-wreath-winner-leaf-label-symbol-of-victory-illustration-2DG8KKT-removebg-preview.png')} style={styles.goldenBorder} />
          <Text style={styles.mainHeroRank}>#1</Text>
          <Text style={styles.mainHeroName}>Zaman Shaikh</Text>
        </View>

        <FlatList
          data={data}
          renderItem={renderHeroItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.heroList}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Footer />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    marginVertical: 30,
    marginBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B3A4B',
  },
  mainHeroContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainHeroAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  mainHeroRank: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1B3A4B',
    marginTop: 20,
  },
  mainHeroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3A4B',
  },
  goldenBorder: {
    position: 'absolute',
    top: -21,
    right: '19.5%',
    width: 200,
    height: 200,
  },
  heroList: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#dedbcd',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    margin: 8,
    width: '45%',
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  heroName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
  },
  goldRank: {
    fontSize: 16,
    color: '#B8860B',
    marginTop: 5,
  },
  silverRank: {
    fontSize: 16,
    color: '#8A8A8A',
    marginTop: 5,
  },
  bronzeRank: {
    fontSize: 16,
    color: '#8C5430',
    marginTop: 5,
  },
  rank: {
    fontSize: 16,
    color: '#988D79',
    marginTop: 5,
  },
});


module.exports = HerShieldHeroes;