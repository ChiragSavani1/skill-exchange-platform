const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
}, {
  strictPopulate: false
});

module.exports = mongoose.model('Skill', SkillSchema);