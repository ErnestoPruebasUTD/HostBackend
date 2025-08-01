import { connectAMQP } from "../config/amqpConfig";

export const publishEmail = async ({
  type,
  data
}: {
  type: 'welcome' | 'resetPassword'; 
  data: {
    to: string;
    name?: string;
    token?: string;
    link?: string;
  };
}): Promise<boolean> => {
  try {
    const message = {
      type,
      data
    };

    const channel = await connectAMQP();
    await channel.assertQueue("emailQueue", { durable: true });

    const sent = channel.sendToQueue(
      "emailQueue",
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    return sent;
  } catch (error) {
    console.error("Error publishing email to queue:", error);
    return false;
  }
};