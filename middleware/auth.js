const Skill = require('../models/Skill');

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

const ensureSkillOwner = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.redirect('/skills');
    }
    if (!skill.createdBy.equals(req.user._id)) {
      return res.redirect('/skills');
    }
    next();
  } catch (err) {
    console.error(err);
    res.redirect('/skills');
  }
};


module.exports = {
  ensureAuthenticated,
  ensureSkillOwner
};