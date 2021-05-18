const { Schema, model } = require('mongoose')

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        max: 255,
    },
    description: {
        type: String,
        required: true,
        max: 1024,
    },
    image: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Fun', 'Love', 'Like', 'Hate', 'Sad']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    reaction: {
        type: Array,
    },
    comment: {
        type: Array,
        max: 1024,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
})

module.exports = model('posts', postSchema)