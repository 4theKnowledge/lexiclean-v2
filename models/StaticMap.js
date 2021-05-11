const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaticMapSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    tokens: [{
        type: String,
        required: true
    }],
    last_modified: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, { _id: true})

module.exports = mongoose.model('StaticMaps', StaticMapSchema)