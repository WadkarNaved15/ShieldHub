const React = require('react');
const { useState,useContext } = React;
const { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } = require('react-native');
const { useNavigation } = require('@react-navigation/native');
const axios = require("axios").default;  // Fix for CommonJS require
const { saveToken,getToken } = require('../functions/secureStorage');
const FCMService = require('../services/fcmService');
const { UserContext } = require('../Context/User');

console.log("Frontend", process.env.BACKEND_URI); // Ensure this is set correctly in your environment

console.log("backend", process.env.BACKEND_URI)
const Login = () => {
    const { login } = useContext(UserContext);
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [viewPassword, setViewPassword] = useState(false);


    const handleLogIn = async () => {
        try {
            console.log(phoneNumber,password)
            const response = await axios.post(`${process.env.BACKEND_URI}/login`, {
                phoneNumber,
                password,
            });
            if (response.status === 200) {
                await login(response.data.accessToken, response.data.refreshToken);
                await FCMService.getFCMToken();
                FCMService.listenForNotifications();
                navigation.navigate('Modules');
            }
        } catch (error) {
            if(error.request){
                console.log(error.request);
            }
            console.error("Login Error:", error);
            if (error.response && error.response.status === 400) {
                Alert.alert('Error', 'Invalid phone number or password');
            } else {
                Alert.alert('Error', 'Something went wrong, please try again later');
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.bottomContainer}>
                <Text style={styles.LogInText}>Log In</Text>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Phone Number:</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Enter your Phone Number"
                        placeholderTextColor="#1B3A4B"
                        keyboardType="number-pad"
                    />

                    <Text style={styles.label}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#1B3A4B"
                        secureTextEntry={!viewPassword}
                    />
                    <Text style={[styles.option, styles.boldText]} onPress={() => setViewPassword(!viewPassword)}>
                        {viewPassword ? "Hide Password" : "Show Password"}
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handleLogIn} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.option, styles.boldText, styles.forgotPassword]} onPress={() => console.log('Forgot Password?')}>
                Forgot Password?
            </Text>
            <Text style={styles.register} onPress={() => navigation.navigate('SignUp')}>
                Don't have an account? <Text style={styles.boldText}>Register</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F1',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    bottomContainer: {
        justifyContent: 'flex-start',
    },
    LogInText: {
        color: '#1B3A4B',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    formContainer: {
        paddingHorizontal: 10,
    },
    label: {
        color: '#1B3A4B',
        marginBottom: 5,
        fontWeight: '500',
        fontSize: 16,
    },
    input: {
        height: 40,
        borderRadius: 10,
        marginBottom: 10,
        color: '#1B3A4B',
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: '#1B3A4B',
    },
    option: {
        color: '#1B3A4B',
        fontSize: 16,
        textAlign: 'right',
        marginBottom: 10,
    },
    register: {
        marginTop: 20,
        color: '#1B3A4B',
        fontSize: 16,
        textAlign: 'center',
    },
    forgotPassword: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    boldText: {
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#d7d0ff',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

module.exports = Login;
