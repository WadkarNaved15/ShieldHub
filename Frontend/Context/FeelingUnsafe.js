const React = require('react');
const { createContext, useState, useEffect } = require('react');
const apiCall = require('../functions/axios');
const axios = require('axios').default;

const FeelingUnsafeContext = createContext();

const FeelingUnsafeProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [intervalTime, setIntervalTime] = useState(5 * 60 * 1000); // Default: 5 min
    const [timeLeft, setTimeLeft] = useState(intervalTime);

    useEffect(() => {
        let timer;
        if (isActive) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        triggerCheckIn();
                        return intervalTime;
                    }
                    return prev - 1000;
                });
            }, 1000);
        } else {
            clearInterval(timer);
            setTimeLeft(intervalTime);
        }
        return () => clearInterval(timer);
    }, [isActive, intervalTime]);

    const triggerCheckIn = async () => {
        try {
            console.log("Triggering Automated Call via Twilio...");
            const response = await apiCall({
                method: 'GET',
                url: `/FeelingUnsafe/triggerCheckIn`
            });
            console.log(response.data);
        } catch (error) {
            console.error("Failed to trigger check-in:", error);
        }
    };

    const startFeelingUnsafe = (customInterval) => {
        setIntervalTime(customInterval || intervalTime);
        setTimeLeft(customInterval || intervalTime);
        setIsActive(true);
    };

    const stopFeelingUnsafe = () => {
        setIsActive(false);
        setTimeLeft(null);

    };

    return (
        <FeelingUnsafeContext.Provider value={{
            isActive,
            intervalTime,
            timeLeft,
            startFeelingUnsafe,
            stopFeelingUnsafe
        }}>
            {children}
        </FeelingUnsafeContext.Provider>
    );
};

module.exports = { FeelingUnsafeProvider, FeelingUnsafeContext };
