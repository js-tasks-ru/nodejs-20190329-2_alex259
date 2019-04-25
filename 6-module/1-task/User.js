const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: [{
            validator(value) {
                return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
            },
            message: 'Некорректный email.',
        }],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },

    displayName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('User', schema);
