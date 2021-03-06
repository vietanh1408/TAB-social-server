const { Schema, model, Types } = require('mongoose')

const ImageSchema = new Schema({
    publicId: {
        type: String,
        default: '',
    },
    url: {
        type: String,
        default: '',
    },
    _id: false,
})

const PostSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'user',
        required: true,
    },
    description: {
        type: String,
        // required: true,
        max: 1024,
        default: '',
    },
    image: {
        type: ImageSchema,
        default: {
            publicId: '',
            url: '',
        },
    },
    likes: [{ type: Types.ObjectId, ref: 'user' }],
    likeLength: {
        type: Number,
        default: 0,
    },
    comments: [{ type: Types.ObjectId, ref: 'comment' }],
    commentLength: {
        type: Number,
        default: 0,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
}, {
    versionKey: false,
})

module.exports = model('post', PostSchema)