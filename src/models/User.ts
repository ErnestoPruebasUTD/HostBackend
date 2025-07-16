import { Document, Schema, Types, model } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    role: "Adm1ni$trad0r" | "M4ntenim1ent0" | "B0t4nic0" | "Default";
    phoneNumber: number;
    status: boolean;
    password: string;
    createDate: Date;
    deleteDate: Date;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        default: '',
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Adm1ni$trad0r", "M4ntenim1ent0", "B0t4nic0", "Default"],
        default: "Default"
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    deleteDate: {
        type: Date
    }
},
 { versionKey: false }
);

export const User = model<IUser>('User', userSchema, 'user');
