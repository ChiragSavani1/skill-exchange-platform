const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Public skills list
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().populate('createdBy').lean();
    
    // Debug output
    console.log('Current User ID:', req.user?._id);
    skills.forEach(skill => {
      console.log(`Skill: ${skill.name}, Creator: ${skill.createdBy?._id}`);
    });
    
    res.render('skills/list', {
      skills,
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('500');
  }
});
// Add new skill
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('skills/add');
});
router.post('/add', ensureAuthenticated, async (req, res) => {
  try {
    // Create the skill
    const skill = await Skill.create({
      name: req.body.name,
      category: req.body.category,
      createdBy: req.user._id
    });

    // Update the user's skills array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { skills: skill._id } },
      { new: true }
    );

    res.redirect('/skills');
  } catch (err) {
    console.error('Error adding skill:', err);
    res.render('skills/add', { 
      error: 'Failed to add skill',
      user: req.user 
    });
  }
});

// Edit skill
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).lean();
    if (!skill) return res.redirect('/skills');
    
    // Verify ownership
    if (skill.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect('/skills');
    }
    
    res.render('skills/edit', { skill });
  } catch (err) {
    console.error('Edit error:', err);
    res.redirect('/skills');
  }
});

router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.redirect('/skills');
    
    // Verify ownership
    if (skill.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect('/skills');
    }
    
    await Skill.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      category: req.body.category
    });
    
    res.redirect('/skills');
  } catch (err) {
    console.error('Update error:', err);
    res.redirect('/skills');
  }
});

// Delete skill
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.redirect('/skills');
    
    // Verify ownership
    if (skill.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect('/skills');
    }
    
    // Remove from user's skills array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { skills: req.params.id } }
    );
    
    // Delete the skill
    await Skill.findByIdAndDelete(req.params.id);
    
    res.redirect('/skills');
  } catch (err) {
    console.error('Delete error:', err);
    res.redirect('/skills');
  }
});
module.exports = router;