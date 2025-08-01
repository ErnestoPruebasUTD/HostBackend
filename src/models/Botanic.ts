import mongoose, { Schema, Document } from 'mongoose';

interface IPlant {
  plantName: string;
  type: string;
  status: 'Growing' | 'Geerntet' | 'Dead';
  plantationDate: Date;
}

export interface IBotanicInventory extends Document {
  name: string;
  ubication: string;
  plants: IPlant[];
  status: boolean;
  createDate: Date;
}

const PlantSchema: Schema = new Schema<IPlant>({
    plantName: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Growing', 'Geerntet', 'Dead'], 
        required: true 
    },
    plantationDate: { 
        type: Date, 
        default: Date.now
    },
},
    { versionKey: false }
);

const BotanicInventorySchema = new Schema<IBotanicInventory>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    ubication: { 
        type: String, 
        required: true 
    },
    plants: {
        type: [PlantSchema],
        default: []
    },
    status: { 
        type: Boolean, 
        default: true 
    },
    createDate: { 
        type: Date, 
        default: Date.now 
    }
},
    { versionKey: false });

export default mongoose.model<IBotanicInventory>('BotanicInventory', BotanicInventorySchema);