// const admin = require("firebase-admin");
// const serviceAccount = require("../config/hershield-firebase.json");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }



// const sendFCMNotification = async (tokens, victimId, location , type = "NEARBY_SOS") => {
//     try {
//         const payload = {
//             notification: {
//                 title: "🚨 Emergency SOS Alert 🚨",
//                 body: "A user near you needs help! Tap for details.",
//                 sound: "default"
//             },
//             data: {
//                 victimId: victimId,
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//                 type,
//                 // type: "SOS"
//             }
//         };
//         // console.log("messaging",tokens)
//         // await admin.messaging().sendEachForMulticast({ tokens, ...payload });
//         // console.log("SOS Notification Sent to Nearby Users");

//         const response = await admin.messaging().sendEachForMulticast({ tokens, ...payload });

// response.responses.forEach((res, idx) => {
//   if (res.success) {
//     console.log(`✅ Token ${idx} SUCCESS`);
//   } else {
//     console.error(`❌ Token ${idx} FAILED`, res.error);
//   }
// });

//     } catch (error) {
//         console.error("Error sending FCM Notification:", error);
//     }
// };

// module.exports = { sendFCMNotification };












const admin = require("firebase-admin");
const serviceAccount = require("../config/hershield-firebase.json");
const Users = require("../model/Users");


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// const sendFCMNotification = async (
//   tokens,
//   victimId,
//   location

// ) => {
//   try {
//     if (!tokens || tokens.length === 0) {
//       console.log("❌ No FCM tokens");
//       return;
//     }

//     const message = {
//   tokens,
//   // 1. Keep the notification object for System-level background handling
//   notification: {
//     title: "🚨 Emergency SOS Alert 🚨",
//     body: "A user near you needs help! Tap for details.",
//   },
//   // 2. Add title/body to DATA as well so Notifee can read it easily in the foreground
//   data: {
//     title: "🚨 Emergency SOS Alert 🚨", 
//     body: "A user near you needs help! Tap for details.",
//     victimId: String(victimId),
//     latitude: String(location.latitude),
//     longitude: String(location.longitude),
//   },
//   android: {
//     priority: "high",
//     notification: {
//       channelId: "shieldhub-alerts", // Ensure this matches notifee.createChannel
//       sound: "default",
//       importance: "high", // Add this to be safe
//     },
//   },
// };




//     const response = await admin.messaging().sendEachForMulticast(message);

//     // response.responses.forEach((res, idx) => {
//     //   if (res.success) {
//     //     console.log(`✅ Token ${idx} SUCCESS`);
//     //   } else {
//     //     console.error(`❌ Token ${idx} FAILED`, res.error.message);
//     //   }
//     // });

//     response.responses.forEach(async (res, idx) => {
//   if (!res.success) {
//     console.error(
//       `❌ Invalid token removed: ${tokens[idx]} →`,
//       res.error.code
//     );

//     // 🔥 REMOVE INVALID TOKEN FROM DB
//     await Users.updateOne(
//       { fcmToken: tokens[idx] },
//       { $set: { fcmToken: null } }
//     );
//   }
// });
//     console.log(
//       `📊 Success: ${response.successCount}, Failed: ${response.failureCount}`
//     );

//     return response;
//   } catch (error) {
//     console.error("❌ Error sending FCM Notification:", error);
//   }
// };





// const sendFCMNotification = async (tokens, victimId, location) => {
//   try {
//     // 1. Filter out any null/undefined tokens to avoid "invalid-argument"
//     const validTokens = tokens.filter(t => t && typeof t === 'string');

//     if (validTokens.length === 0) {
//       console.log("❌ No valid FCM tokens to send to");
//       return;
//     }

//     const message = {
//       tokens: validTokens, // Use the cleaned array
//       notification: {
//         title: "🚨 Emergency SOS Alert 🚨",
//         body: "A user near you needs help! Tap for details.",
//       },
//       data: {
//         title: "🚨 Emergency SOS Alert 🚨", // Duplicate here for foreground Notifee
//         body: "A user near you needs help! Tap for details.",
//         victimId: String(victimId),
//         latitude: String(location.latitude),
//         longitude: String(location.longitude),
//       },
//       android: {
//         priority: "high",
//         notification: {
//           channelId: "shieldhub-alerts", 
//           sound: "default",
//           importance: "high",
//         },
//       },
//     };

//     const response = await admin.messaging().sendEachForMulticast(message);
    
//     // Cleanup logic for failed tokens
//     response.responses.forEach(async (res, idx) => {
//       if (!res.success) {
//         console.error(`❌ Token Failed: ${validTokens[idx]} -> ${res.error.code}`);
//         // If the token is truly invalid/expired, remove it
//         if (res.error.code === 'messaging/registration-token-not-registered' || 
//             res.error.code === 'messaging/invalid-argument') {
//           await Users.updateOne(
//             { fcmToken: validTokens[idx] },
//             { $set: { fcmToken: null } }
//           );
//         }
//       }
//     });

//     console.log(`📊 Success: ${response.successCount}, Failed: ${response.failureCount}`);
//   } catch (error) {
//     console.error("❌ Critical FCM Error:", error);
//   }
// };







const sendFCMNotification = async (tokens, victimId, location) => {
  try {
    const registrationTokens = tokens.filter(t => typeof t === 'string' && t.length > 0);
    if (registrationTokens.length === 0) return;

    const message = {
      tokens: registrationTokens,
      notification: {
        title: "🚨 Emergency SOS Alert 🚨",
        body: "A user near you needs help! Tap for details.",
      },
      data: {
        victimId: String(victimId),
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        screen: 'ResponderMap', // Helps frontend routing
      },
      android: {
        priority: "high",
        notification: {
          channelId: "shieldhub-alerts",
          sound: "siren", // Matches your Notifee config
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`📊 Success: ${response.successCount}, Failed: ${response.failureCount}`);

    // OPTIMAL: Automatic Cleanup of Dead Tokens
    if (response.failureCount > 0) {
      const deadTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error.code;
          if (error === 'messaging/registration-token-not-registered' || 
              error === 'messaging/invalid-registration-token') {
            deadTokens.push(registrationTokens[idx]);
          }
        }
      });

      if (deadTokens.length > 0) {
        // Purge dead tokens from MongoDB
        await Users.updateMany(
          { fcmToken: { $in: deadTokens } },
          { $set: { fcmToken: null } }
        );
        console.log(`🧹 Cleaned ${deadTokens.length} dead tokens from DB.`);
      }
    }
    return response;
  } catch (error) {
    console.error("❌ FCM SEND ERROR:", error);
  }
};

module.exports = { sendFCMNotification };