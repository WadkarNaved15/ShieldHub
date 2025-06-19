const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  // aadharNumber: {
  //   type: String,
  //   // required: true,
  //   unique: true,
  //   minlength: 14,
  //   maxlength: 14
  // },
  profileImage: {
    type: String,
  },
  achievements: [{
    achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievements',
    },
    dateEarned: {
        type: Date,
        default: Date.now,
    },
  }],
  
}, { timestamps: true });

// Add 2dsphere index for geospatial queries
userSchema.index({ current_location: '2dsphere' }); // Create 2dsphere index for the current_location field

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
