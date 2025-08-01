import { Document, Types, Schema, model } from 'mongoose';

export interface IMotorOutput extends Document {
  _id: Types.ObjectId;
  VERTICAL: boolean;
  RIEGO: boolean;
  AGITACION: boolean;
  CASCADA: boolean;
  MOSQUITOS: boolean;
  estado: boolean;
  fechaCreacion: Date;
  ultimaModificacion: Date;
}

const motorOutputSchema = new Schema<IMotorOutput>({
  VERTICAL: {
    type: Boolean,
    required: true,
    default: false
  },
  RIEGO: {
    type: Boolean,
    required: true,
    default: false
  },
  AGITACION: {
    type: Boolean,
    required: true,
    default: false
  },
  CASCADA: {
    type: Boolean,
    required: true,
    default: false
  },
  MOSQUITOS: {
    type: Boolean,
    required: true,
    default: false
  },
  estado: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  ultimaModificacion: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

export const SalidaMotor = model<IMotorOutput>('SalidaMotor', motorOutputSchema, 'salidasMotor');