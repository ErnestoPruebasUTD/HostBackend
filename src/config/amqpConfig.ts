import * as amqp from 'amqplib';

let channel: amqp.Channel | null = null;
let connection: amqp.Connection | null = null;

export const connectAMQP = async (): Promise<amqp.Channel> => {
  if (channel) return channel;

  try {
    connection = await amqp.connect(process.env.CLOUDAMQP_URL || '');
    channel = await connection.createChannel();
    
    connection.on('close', () => {
      console.log('AMQP connection closed');
      channel = null;
      connection = null;
    });

    return channel;
  } catch (error) {
    console.error('Error connecting to AMQP:', error);
    throw error;
  }
};

export const closeAMQP = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } finally {
    channel = null;
    connection = null;
  }
};