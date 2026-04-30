import axios from 'axios';

// Typically these would come from environment variables
const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';

const getAuthToken = () => {
    return sessionStorage.getItem('accessToken');
};

const getHeaders = () => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const registerNotificationToken = async (userId: string, fcmToken: string) => {
    try {
        const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications/register`, {
            userId,
            fcmToken,
            platform: 'web',
            deviceInfo: navigator.userAgent
        }, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error('Failed to register notification token:', error);
        throw error;
    }
};

export const unsubscribeNotificationToken = async (fcmToken: string) => {
    try {
        const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications/unsubscribe`, {
            fcmToken
        }, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error('Failed to unsubscribe notification token:', error);
        throw error;
    }
};

export const getUserNotifications = async (userId: string) => {
    try {
        const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications/${userId}`, { headers: getHeaders() });
        return response.data.notifications || [];
    } catch (error) {
        console.error('Failed to fetch user notifications:', error);
        return [];
    }
};

export const markNotificationsAsRead = async (userId: string) => {
    try {
        const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications/mark-read`, {
            userId
        }, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        return null;
    }
};