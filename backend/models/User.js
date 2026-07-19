const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    college:{
        type:String,
        default:""
    },

    branch:{
        type:String,
        default:""
    },

    year:{
        type:Number
    },

    skills:{
        type:[String],
        default:[]
    },

    preferredRole:{
        type:String,
        enum:[
            "Frontend",
            "Backend",
            "Full Stack",
            "AI/ML",
            "UI/UX",
            "DevOps",
            "Blockchain",
            "Mobile"
        ],
        default:"Full Stack"
    },

    interests:{
        type:[String],
        default:[]
    },

    availability:{
        type:String,
        enum:[
            "Weekdays",
            "Weekend",
            "Anytime"
        ],
        default:"Anytime"
    },

    location:{
        type:String,
        default:""
    },

    github:{
        type:String,
        default:""
    },

    linkedin:{
        type:String,
        default:""
    },

    bio:{
        type:String,
        default:""
    },

    experience:{
        type:String,
        enum:[
            "Beginner",
            "Intermediate",
            "Advanced"
        ],
        default:"Beginner"
    },

    trustScore:{
        type:Number,
        default:50
    },

    totalHackathons:{
        type:Number,
        default:0
    },

    completedHackathons:{
        type:Number,
        default:0
    },

    averageRating:{
        type:Number,
        default:0
    },

    role:{
        type:String,
        enum:["user","participant","organizer","admin"],
        default:"user"
    },

    registeredHackathons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon"
        }
    ],

    interestedHackathons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon"
        }
    ],

    experienceLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner"
    },

    avatar: {
        type: String,
        default: ""
    },

    interestedDomains: {
        type: [String],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    lookingForTeam: {
        type: Boolean,
        default: true
    },

    lastActive: {
        type: Date,
        default: Date.now
    },

    profileCompletion: {
        type: Number,
        default: 0
    },

    notifications: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            type: { type: String, default: "join_request" },
            message: { type: String, required: true },
            applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
            teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
            teamName: { type: String },
            fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            fromUserName: { type: String },
            fromUserAvatar: { type: String },
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ],

    resumeText: {
        type: String,
        default: ""
    },
    projects: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    totalXP: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    hackathonsParticipated: {
        type: Number,
        default: 0
    },
    hackathonsWon: {
        type: Number,
        default: 0
    },
    projectsCompleted: {
        type: Number,
        default: 0
    },
    profileViews: {
        type: Number,
        default: 0
    },
    badges: {
        type: [String],
        default: []
    },
    region: {
        type: String,
        default: "India"
    }

},
{
    timestamps:true
});

const calculateProfileCompletion = require("../utils/calculateProfileCompletion");

userSchema.pre("save", function() {
    this.profileCompletion = calculateProfileCompletion(this);
    this.lastActive = new Date();
});

module.exports = mongoose.model("User", userSchema);
module.exports.calculateProfileCompletion = calculateProfileCompletion;
