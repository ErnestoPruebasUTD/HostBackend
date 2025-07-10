import { connectAMQP } from '../config/amqpConfig';

interface EmailMessage {
  type: 'welcome' | 'resetPassword';
  data: {
    to: string;
    firstName?: string;
    name?: string;
    token?: string;
  };
}

export const publishEmail = async (message: EmailMessage): Promise<boolean> => {
  try {
    const channel = await connectAMQP();
    await channel.assertQueue('emailQueue', { durable: true });
    
    const sent = channel.sendToQueue(
      'emailQueue',
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    return sent;
  } catch (error) {
    console.error("Error al publicar el mensaje en la cola:", error);
    return false;
  }
};