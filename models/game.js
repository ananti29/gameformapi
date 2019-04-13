let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// create schema fields
let GameSchema = new Schema(
    {
        gamename: { type: String, required: true },
        platform: { type: String, required: true, enum: ['Xbox', 'Playstation', 'PC'], default: 'PC' },
        notes: { type: String }
    },
    {
        // add created_at and updated_at to the schema
        timestamps: true
    }
);

// Virtual for game's URL
GameSchema
    .virtual('url')
    .get(function virtualGameUrl () {
        return this._id;
    });

// Export model
module.exports = mongoose.model('Game', GameSchema);
