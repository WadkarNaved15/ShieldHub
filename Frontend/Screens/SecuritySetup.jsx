const React = require('react');
const { useState, useEffect } = React;
const { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } = require('react-native');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useNavigation, useRoute } = require('@react-navigation/native');
const axios = require('axios').default;
import { BACKEND_URI } from '@env';

const SecuritySetup = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();

    // ── Pull all data passed from SignUp page ──
    const { fullName, phoneNumber, email, password, gender, age, role } = route.params;

    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [emergencyPhrase, setEmergencyPhrase] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (pin.length === 4 && confirmPin.length === 4 && emergencyPhrase.trim() !== '') {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [pin, confirmPin, emergencyPhrase]);

    const handleSubmit = async () => {
        if (pin.length !== 4 || confirmPin.length !== 4) {
            Alert.alert('Error', 'PIN must be exactly 4 digits');
            return;
        }
        if (pin !== confirmPin) {
            Alert.alert('Error', 'PINs do not match. Please try again.');
            return;
        }
        if (emergencyPhrase.trim() === '') {
            Alert.alert('Error', 'Please enter an emergency phrase');
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URI}/register`, {
                fullName,
                phoneNumber,
                email,
                password,
                gender,
                age,
                role,
                secretPin: pin,
                emergencyPhrase: emergencyPhrase.trim(),
            });

            if (response.status === 200) {
                Alert.alert('Success', 'User registered successfully');
                navigation.navigate('Login');
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
                <Text style={styles.headingText}>Security Setup</Text>
                <Text style={styles.subHeadingText}>
                    Set a secret PIN and an emergency phrase to keep your account safe.
                </Text>

                <View style={styles.formContainer}>

                    {/* ── Secret PIN ── */}
                    <Text style={styles.label}>Secret PIN:</Text>
                    <TextInput
                        style={styles.input}
                        value={pin}
                        onChangeText={(text) => {
                            if (/^\d{0,4}$/.test(text)) setPin(text);
                        }}
                        placeholder="Enter 4-digit PIN"
                        placeholderTextColor="#1B3A4B"
                        keyboardType="number-pad"
                        secureTextEntry={!showPin}
                        maxLength={4}
                    />
                    <Text
                        style={[styles.option, styles.boldText]}
                        onPress={() => setShowPin(!showPin)}
                    >
                        {showPin ? 'Hide PIN' : 'Show PIN'}
                    </Text>

                    {/* ── Confirm PIN ── */}
                    <Text style={styles.label}>Confirm PIN:</Text>
                    <TextInput
                        style={[
                            styles.input,
                            confirmPin.length === 4 && (pin === confirmPin ? styles.matchInput : styles.mismatchInput),
                        ]}
                        value={confirmPin}
                        onChangeText={(text) => {
                            if (/^\d{0,4}$/.test(text)) setConfirmPin(text);
                        }}
                        placeholder="Re-enter 4-digit PIN"
                        placeholderTextColor="#1B3A4B"
                        keyboardType="number-pad"
                        secureTextEntry={!showConfirmPin}
                        maxLength={4}
                    />
                    {confirmPin.length === 4 && (
                        <Text style={[styles.feedbackText, pin === confirmPin ? styles.matchText : styles.mismatchText]}>
                            {pin === confirmPin ? '✓ PINs match' : '✗ PINs do not match'}
                        </Text>
                    )}
                    <Text
                        style={[styles.option, styles.boldText]}
                        onPress={() => setShowConfirmPin(!showConfirmPin)}
                    >
                        {showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                    </Text>

                    {/* ── Emergency Phrase ── */}
                    <Text style={styles.label}>Emergency Phrase:</Text>
                    <Text style={styles.hintText}>
                        This phrase will be used to trigger an emergency alert silently.
                    </Text>
                    <TextInput
                        style={[styles.input, styles.phraseInput]}
                        value={emergencyPhrase}
                        onChangeText={setEmergencyPhrase}
                        placeholder="e.g. 'The weather is nice today'"
                        placeholderTextColor="#1B3A4B"
                        autoCapitalize="none"
                        multiline
                    />

                    {/* ── Submit Button ── */}
                    <TouchableOpacity
                        style={[styles.button, disabled && styles.disabledButton]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={disabled}
                    >
                        <Text style={styles.buttonText}>Complete Registration</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.register} onPress={() => navigation.goBack()}>
                    ← <Text style={styles.boldText}>Go Back</Text>
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
        bottom: '5%',
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    headingText: {
        color: '#1B3A4B',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    subHeadingText: {
        color: '#1B3A4B',
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.7,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    label: {
        color: '#1B3A4B',
        marginBottom: 5,
        fontWeight: '500',
        fontSize: 16,
    },
    hintText: {
        color: '#1B3A4B',
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 6,
        fontStyle: 'italic',
    },
    option: {
        color: '#1B3A4B',
        fontSize: 16,
        textAlign: 'right',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderRadius: 10,
        marginBottom: 6,
        color: '#1B3A4B',
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: '#1B3A4B',
    },
    phraseInput: {
        height: 70,
        textAlignVertical: 'top',
        paddingTop: 10,
        marginBottom: 20,
    },
    matchInput: {
        backgroundColor: '#d4f5d4',
        borderColor: '#1b5e20',
    },
    mismatchInput: {
        backgroundColor: '#fde8e8',
        borderColor: '#b71c1c',
    },
    feedbackText: {
        fontSize: 13,
        marginBottom: 4,
        fontWeight: '500',
    },
    matchText: {
        color: '#2e7d32',
    },
    mismatchText: {
        color: '#b71c1c',
    },
    button: {
        backgroundColor: '#d7d0ff',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    register: {
        color: '#1B3A4B',
        fontSize: 16,
        textAlign: 'left',
    },
    boldText: {
        fontWeight: 'bold',
    },
});

module.exports = SecuritySetup;