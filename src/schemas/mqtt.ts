import mongoose from 'mongoose'

export interface MqttIface {
    _id: any,
    name: string,
    line: string,
    ip: string,
    plc: string,
    sensor: string,
    value: string
}

const MqttSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is mandatory!']
    },
    line: {
        type: String,
        required: [true, 'Line is mandatory!']
    },
    ip: {
        type: String,
        required: [true, 'Ip is mandatory!']
    },
    plc: {
        type: String,
        required: [true, 'Plc is mandatory!']
    },
    sensor: {
        type: String,
        required: [true, 'Sensor is mandatory!']
    },
    value: {
        type: String,
        required: [true, 'Value is mandatory!']
    }
});

export default MqttSchema;