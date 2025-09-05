import mongoose from 'mongoose'

export interface ShiftIface {
    _id?: any,
    name: string,
    startTime: string, // Format: "HH:MM" (24-hour format)
    endTime: string,   // Format: "HH:MM" (24-hour format)
    createdAt?: Date,
    updatedAt?: Date
}

const ShiftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shift name is mandatory!'],
        trim: true,
        maxLength: [50, 'Shift name cannot exceed 50 characters']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is mandatory!'],
        validate: {
            validator: function (v: string) {
                // Validate HH:MM format (24-hour)
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Start time must be in HH:MM format (24-hour)'
        }
    },
    endTime: {
        type: String,
        required: [true, 'End time is mandatory!'],
        validate: {
            validator: function (v: string) {
                // Validate HH:MM format (24-hour)
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'End time must be in HH:MM format (24-hour)'
        }
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'shifts'
});

export default ShiftSchema;
