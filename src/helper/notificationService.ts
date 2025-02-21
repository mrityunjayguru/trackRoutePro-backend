import { admin } from "./firebase";

// Define the notification payload structure more clearly
export const sendPushNotification = async (notification: any) => {
  if (!notification || !notification.token || notification.token.length === 0) {
    throw new Error('Invalid token or no tokens provided');
  }

  // Constructing the messages array for each token
  const messages = notification.token.map((token: string) => ({
    notification: {
      title: notification.notification.title, // Use actual title from the notification object
      body: notification.notification.body,   // Use actual body from the notification object
    },
    token: token,
    android: {
      notification: {
        channel_id: "high_importance_channel",
        sound:"message_alert" // Set the custom sound for Android devices
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default' // Set a default sound or another setting for iOS devices
        }
      }
    }
  }));



  try {
    // Using send() for each token individually
    const responses = await Promise.all(
      messages.map((message: any) => admin.messaging().send(message))
    );
    return {
      status: 'success',
      messageIds: responses // Array of message IDs for each sent notification
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      status: 'fail',
      error: error
    };
  }
};
