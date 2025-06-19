const React = require('react');
const { useState } = require('react');
const { View, TextInput, Button, Image, Text, StyleSheet, Alert } = require('react-native');
const { launchImageLibrary } = require('react-native-image-picker');
const axios = require('axios').default;


const BACKEND_URI = process.env.BACKEND_URI || 'http://your-backend-url.com';

 function AchievementForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageUploaded, setImageUploaded] = useState(false);

    const pickImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
            includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.error('Image Picker Error:', response.errorMessage);
                Alert.alert('Error', 'Could not pick an image.');
            } else {
                setImage(response.assets[0].uri);
            }
        });
    };

    const handleSubmit = async () => {
        if (!title || !description || !image) {
            Alert.alert('Error', 'Please fill all fields and select an image.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('img', {
            uri: image,
            type: 'image/jpeg',
            name: 'achievement.jpg',
        });

        try {
            const response = await axios.post(`${BACKEND_URI}/achievements/form`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            setImageUploaded(true);
            Alert.alert('Success', 'Achievement added successfully!');
        } catch (error) {
            console.error('Error uploading data:', error);
            Alert.alert('Error', 'Could not add achievement.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Achievement</Text>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <Button title="Pick an image" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Submit" onPress={handleSubmit} />
            {imageUploaded && <Text style={styles.success}>Image uploaded successfully!</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    image: {
        width: 150,
        height: 150,
        marginVertical: 10,
        borderRadius: 10,
    },
    success: {
        color: 'green',
        marginTop: 10,
        textAlign: 'center',
    },
});

module.exports = AchievementForm;