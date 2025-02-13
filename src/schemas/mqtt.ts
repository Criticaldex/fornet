import mongoose, { Schema } from 'mongoose'

export interface MqttIface {
    _id?: any,
    name?: string,
    line: string,
    ip?: string,
    plc?: string,
    sensor?: string,
    value?: string
}

const MqttSchema = new mongoose.Schema({
    name: {
        type: String
    },
    line: {
        type: String,
        required: [true, 'Line is mandatory!']
    },
    ip: {
        type: String,
    },
    plc: {
        type: String,
    },
    sensor: {
        type: String,
    },
    value: {
        type: String,
    }
});

export default MqttSchema;