const { View, Text, Image, TouchableOpacity } = require('react-native');
const React = require('react');
const { styles } = require('./ProfileDrawer');

const defaultMaleImage = require('./../assets/male.png');
const defaultFemaleImage = require('./../assets/female.png');

const ProfileHeader = ({ user, pickImage }) => {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileImageOuterContainer}>
          <View style={styles.profileImageInnerContainer}>
            <Image
              source={user.profileImage ? { uri: user.profileImage } : (user.gender === 'Male' ? defaultMaleImage : defaultFemaleImage)}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.editImageContainer}>
            <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
              <Image source={require('./../assets/edit.png')} style={styles.editImage} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.profileName}>{user.fullName}</Text>
        <Text style={styles.profilePhoneNumber}>+91 {user.phoneNumber}</Text>
      </View>
    );
  };

  module.exports = ProfileHeader;