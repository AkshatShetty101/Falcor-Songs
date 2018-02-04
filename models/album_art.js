var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    name: String,
    data: String
});

var albumArtSchema = new Schema(
    {
        image : imageSchema,
        album : {
            type: String,
            required : true
        }
    },
    {
        timestamps : true
});

module.exports = mongoose.model('albumart',albumArtSchema);
