import { Document, Types, Schema, model } from 'mongoose';

interface ISensorReading {
  ph: number;
  conductivity: number;
  temperature: number;
  level: number;
}

export interface ISensorData extends Document {
  _id: Types.ObjectId;
  sensors: ISensorReading[];
  status: boolean;
  createDate: Date;
}

const sensorReadingSchema = new Schema<ISensorReading>({
  ph: {
    type: Number,
    required: true,
    min: 0,
  },
  conductivity: {
    type: Number,
    required: true,
    min: 0
  },
  temperature: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
  }
}, { _id: false }); 

const sensorDataSchema = new Schema<ISensorData>({
  sensors: {
    type: [sensorReadingSchema],
    required: true,
    validate: {
      validator: (v: ISensorReading[]) => v.length > 0,
      message: 'Debe haber al menos una lectura de sensores'
    }
  },
  status: {
    type: Boolean,
    default: true
  },
  createDate: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

export const SensorData = model<ISensorData>('SensorData', sensorDataSchema, 'sensorData');