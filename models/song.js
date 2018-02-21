var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var songSchema = new Schema(
    {
        albumArt : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'albumart'
        },
        name: {
            type: String,
            required: true
        },
        artist:{
            type: String,
            required: true
        },
        album:{
            type: String,
            required: true
        },
        genre:{
            type: String,
            required: true
        },
        solo :{
            type : Boolean,
            required : true,
            default : false
        },
        yearOfRelease:{
            type: Number,
            required: true
        },
        rating:{
            type: Number
        }
    },
    {
        timestamps : true
    }
);

module.exports = mongoose.model('song',songSchema);
