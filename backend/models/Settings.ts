import mongoose, { Schema } from 'mongoose';


const SettingsSchema = new Schema ({
    refreshToken: { type: String, required: true }
});

export default mongoose.model('Settings', SettingsSchema);