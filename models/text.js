const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const textSchema = new Schema({ //_id automatically generated
    frenchVersion : {
        type : String,
        required : true
    },
    englishVersion : {
        type : String,
        required : true
    },
    arabicVersion : {
        type : String,
        required : true
    },
    state : {
        type: String,
        required: true
    }
}, {
    timestamps : true
});

module.exports = mongoose.model('text', textSchema);