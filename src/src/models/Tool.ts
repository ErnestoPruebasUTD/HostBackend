import { Document, Types, Schema, model } from 'mongoose';

export interface IToolInventory extends Document {
    _id: Types.ObjectId;
    toolName: string;
    description: "Active" | "InUse" | "Maintenance" | "Disabled"
    status: boolean;
    createDate: Date;
}

const toolInventorySchema = new Schema<IToolInventory>({
    toolName: {
        type: String, 
        required: true,
        unique: true
    },
    
    description: {
        type: String,
        enum: ["Active", "InUse", "Maintenance", "Disabled"],
        required: true,
    },

    status: {
        type: Boolean,
        default: true
    },

    createDate: {
        type: Date,
        default: Date.now
    }
},  {
        versionKey: false
    }
);

export const ToolInventory = model<IToolInventory>('ToolInventory', toolInventorySchema, 'toolInventory')