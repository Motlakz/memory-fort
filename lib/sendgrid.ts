export const sendNotificationEmail = async (subject: string, text: string, to: string = 'user@example.com') => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, text, to }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
  
      const data = await response.json();
      console.log('Email sent successfully');
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
};
