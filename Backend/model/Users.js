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


  fcmToken: {
  type: String,
  default: null,
},

  secretPin: {
            type: String,
            
        },

        emergencyPhrase: {
            type: String,
            
            trim: true,
        },


  // aadharNumber: {
  //   type: String,
  //   // required: true,
  //   unique: true,
  //   minlength: 14,
  //   maxlength: 14
  // },


  role: {
  type: String,
  enum: ['parent', 'kid', 'hershield', 'senior'],
  required: true,
  default: 'hershield' // or based on logic during signup
},

parentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Users', // reference to parent user
},

kidIds: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Users', // reference to children
}],

kidCode: {
  type: String,
  unique: true,
  sparse: true,
},




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


  // ✅ New fields for Kid Tracking
  mood: {
    type: String,
    default: "😊"
  },

  isEmergency: {
    type: Boolean,
    default: false
  },

  lastCheckIn: {
    type: Date
  },

  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  
}, { timestamps: true });

// Add 2dsphere index for geospatial queries
userSchema.index({ current_location: '2dsphere' }); // Create 2dsphere index for the current_location field

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
