const React = require('react');
const { useState, useEffect } = React;
const { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useNavigation } = require('@react-navigation/native');
const axios = require('axios').default;

const SignUp = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [fullName, setFullName] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [viewPassword,setViewPassword]= useState(false)

    const handleSendOtp = async () => {
        if (phoneNumber === '') {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }
        try {
            const response = await axios.post(`${process.env.BACKEND_URI}/send-otp`, { phoneNumber });
            if (response.status === 200) {
                setShowOtpInput(true);
                Alert.alert('Success', 'OTP sent to your phone number');
            }
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 400 && error.response.data.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'Failed to send OTP. Please try again.');
            }
        }
    };
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a 6-digit OTP');
            return;
        }
        try {
            console.log("otp",otp)
            const response = await axios.post(`${process.env.BACKEND_URI}/verify-otp`, { phoneNumber, otp });
            if (response.status === 200) {
                setOtpVerified(true);
                Alert.alert('Success', 'OTP verified successfully');
            }
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 400 && error.response.data.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'Failed to verify OTP. Please try again.');
            }
        }
    };
    useEffect(() => {
        // Check if all required fields are filled and OTP is verified
        if (fullName && phoneNumber && password && gender && age && otpVerified) {
            setDisabled(false); // Enable the button
        } else {
            setDisabled(true); // Disable the button
        }
    }, [fullName, phoneNumber, password, gender, age, otpVerified]);
    

    useEffect(() => {
        if (otp.length === 6) {
            handleVerifyOtp(otp);
        }
    }, [otp]);
    // const handleSignup = async() => {
    //     if(fullName === '' || phoneNumber === '' || password === '' || gender === '' || age === '') {
    //         alert('Please fill all the fields');
    //         return;
    //     } else if(gender === 'Male' && age < 18) {
    //         alert('You are not eligible for this service');
    //         return;
    //     } else if(gender === 'Female' && age < 15) {
    //         alert('You are not eligible for this service');
    //         return;
    //     }

    //     try {
    //         const response = await axios.post(`${BACKEND_URI}/register`, {
    //             phoneNumber,
    //             fullName,
    //             age,
    //             gender,
    //           });
    //       if (response.status === 200) {
    //         navigation.navigate('PhoneOtp');
    //       }
    //     } catch (error) {
    //       console.log(error);
    //       if (error.response && error.response.status === 400 && error.response.data.message) {
    //         Alert.alert('Error', error.response.data.message);
    //       } else {
    //         Alert.alert('Error', 'Something went wrong, please try again later');
    //       }
    //     }
    // };
    const handleSignup = async () => {
        if (fullName === '' || phoneNumber === '' || password === '' || gender === '' || age === '' || !otpVerified) {
            Alert.alert('Error', 'Please fill all the fields and verify OTP');
            return;
        }
    
        if (gender === 'Male' && age < 18) {
            Alert.alert('Error', 'You are not eligible for this service');
            return;
        } else if (gender === 'Female' && age < 15) {
            Alert.alert('Error', 'You are not eligible for this service');
            return;
        }
    
        try {
            const response = await axios.post(`${process.env.BACKEND_URI}/register`, {
                fullName,
                phoneNumber,
                password,
                gender,
                age,
            });
    
            if (response.status === 200) {
                Alert.alert('Success', 'User registered successfully');
                navigation.navigate('Login'); // Redirect to login page
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400 && error.response.data.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'Something went wrong, please try again later');
            }
        }
    };
    

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.bottomContainer}>
                <Text style={styles.SignupText}>Sign Up</Text>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Full Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#1B3A4B"
                    />
                      <Text style={styles.label}>Phone Number:</Text>
                <View style={styles.otpcontainer}>
                  
                    <TextInput
                        style={[styles.input,styles.phoneinput]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Enter your Phone Number"
                        placeholderTextColor="#1B3A4B"
                        keyboardType="number-pad"
                    /> 
                    <TouchableOpacity style={[styles.button,styles.sendotp]} onPress={handleSendOtp}>
                        <Text style={styles.buttonText}>Send OTP</Text>
                    </TouchableOpacity>
                </View>

                {showOtpInput && (
                        <>
                            <Text style={styles.label}>OTP:</Text>
                            <TextInput
                                style={[styles.input, otpVerified && styles.disabledInput]}

                                value={otp}
                                onChangeText={setOtp}
                                placeholder="Enter OTP"
                                placeholderTextColor="#1B3A4B"
                                keyboardType="numeric"
                                editable={!otpVerified} // Disable the input if OTP is verified
                            />
                        </>
                    )}

                    <Text style={styles.label}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#1B3A4B"
                        secureTextEntry = {!viewPassword}
                    />
                    <Text style={[styles.option,styles.boldText]} onPress={() => setViewPassword(!viewPassword)} >{viewPassword?'Hide Password':'Show Password'}</Text>
                    <View style={styles.rowContainer}>
                        <View style={styles.ageContainer}>
                            <Text style={styles.label}>Age:</Text>
                            <TextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                placeholder="Age"
                                placeholderTextColor="#1B3A4B"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.genderContainer}>
                            <Text style={styles.label}>Gender:</Text>
                            <View style={styles.genderButtons}>
                                <TouchableOpacity
                                    style={[styles.genderButton, gender === 'Male' && styles.selectedGender]}
                                    onPress={() => setGender('Male')}
                                >
                                    <Text style={gender === 'Male' ? styles.selectedGenderText : styles.genderText}>M</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.genderButton, gender === 'Female' && styles.selectedGender]}
                                    onPress={() => setGender('Female')}
                                >
                                    <Text style={gender === 'Female' ? styles.selectedGenderText : styles.genderText}>F</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity  style={styles.button} onPress={handleSignup} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.register} onPress={() => navigation.navigate('Login')}>
                    Already have an account? <Text style={styles.boldText} >Log In</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F1',
    },
    bottomContainer: {
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: "5%",
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    SignupText: {
        color: '#1B3A4B',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    otpcontainer: {
        
        flex:1,
        display: 'flex',
        flexDirection: 'row',
        gap: 10
    
    },
    label: {
        color: '#1B3A4B',
        marginBottom: 5,
        fontWeight: '500',
        fontSize: 16,
    },
    option: {
        color: '#1B3A4B',
        fontSize: 16,
        textAlign: 'right',
        marginBottom: 10,
    },

    phoneinput: {
        width:"70%"
    },
    sendotp: {
        width:"30%"
    },
    disabledInput: {
        backgroundColor: '#d4f5d4', // Light green background
        color: '#2e7d32',          // Dark green text color
        borderColor: '#1b5e20',    // Darker green border
    },
    
    input: {
        height: 40,
        borderRadius: 10, // Curved corners
        marginBottom: 10,
        color: '#1B3A4B',
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        borderWidth: 1,
        borderColor: '#1B3A4B',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    ageContainer: {
        flex: 1,
        marginRight: 5,
    },
    genderContainer: {
        flex: 1,
        marginLeft: 5,
    },
    genderButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 5,
        backgroundColor: '#E8E8E8', 
    },
    selectedGender: {
        backgroundColor: '#1B3A4B',
        
    },
    selectedGenderText: {
        color: 'white',
    },
    genderText: {
        color: '#1B3A4B',
        fontSize: 16,
    },
    register: {
        color: '#1B3A4B',
        fontSize: 16,
        textAlign: 'left',
    },
    boldText: {
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#d7d0ff',
        borderRadius: 10, // Curved corners
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center', // Center the text horizontally
    },
    buttonText: {
        color: '#000', // Text color for the button
        fontSize: 16,
        fontWeight: 'bold',
    }
});

module.exports = SignUp;
