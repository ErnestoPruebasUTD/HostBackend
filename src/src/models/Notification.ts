// models/Notification.ts
import { Document, Schema, model } from 'mongoose';

export interface INotification extends Document {
  message: string;
  data?: {
    sensor: string;
    value: number;
    timestamp: Date;
    alertType: string;
  };
  timestamp: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    message: {
      type: String,
      required: true,
    },
    data: {
      sensor: { type: String },
      value: { type: Number },
      timestamp: { type: Date },
      alertType: { type: String },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export const Notification = model<INotification>('Notification', notificationSchema, 'notifications');
