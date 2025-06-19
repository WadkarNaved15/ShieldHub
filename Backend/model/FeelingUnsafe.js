const mongoose = require('mongoose');

const FeelingUnsafeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, 
  phone: { type: String, required: true, unique: true },
  interval: { type: Number, required: true }, // Interval in minutes
  lastCheckIn: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('FeelingUnsafe', FeelingUnsafeSchema);
