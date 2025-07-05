// In models/ClassSchedule.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  kidName: String, 
  subject: String,
  startTime: String, // '14:00'
  endTime: String,   // '14:45'
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassSchedule', classSchema);
