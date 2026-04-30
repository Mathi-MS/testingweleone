const PAYMENT_BASE_URL = 'https://app.wele.in/api/payment';
// const PAYMENT_BASE_URL = 'https://e7b8-103-186-120-55.ngrok-free.app/api/payment';

export const paymentApi = {
  getConfig: async (token: string | null) => {
    const response = await fetch(`${PAYMENT_BASE_URL}/config`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to get payment config');
    return response.json();
  },

  initiatePayment: async (batchId: string, userId: string, refCode: string, token: string | null) => {
    const response = await fetch(`${PAYMENT_BASE_URL}/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ batchId, userId,  ...(refCode && { refCode }), })
    });
    if (!response.ok) throw new Error('Failed to initiate payment');
    return response.json();
  },

  verifyPayment: async (response: any, token: string | null) => {
    const res = await fetch(`${PAYMENT_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json();
  }
};
