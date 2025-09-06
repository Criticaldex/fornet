import mongoose from 'mongoose'

export interface PowerBIIface {
    entraToken: {
        clientId: string,
        clientSecret: string,
        tenantId: string,
    },
    dataset: string,
    reportId: string,
    groupId: string,
}

const PowerBISchema = new mongoose.Schema({
    entraToken: {
        clientId: {
            type: String,
            required: [true, 'Client ID is required!']
        },
        clientSecret: {
            type: String,
            required: [true, 'Client Secret is required!']
        },
        tenantId: {
            type: String,
            required: [true, 'Tenant ID is required!']
        }
    },
    dataset: {
        type: String,
        required: [true, 'Dataset is required!']
    },
    reportId: {
        type: String,
        required: [true, 'Report ID is required!']
    },
    groupId: {
        type: String,
        required: [true, 'Group ID is required!']
    }
});

export default PowerBISchema;
