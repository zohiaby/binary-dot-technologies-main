const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function signToken(adminId) {
  return jwt.sign({ sub: adminId, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'An admin with this email already exists' });
    }
    const passwordHash = await Admin.hashPassword(password);
    const admin = await Admin.create({ name, email, passwordHash });
    const token = signToken(admin._id.toString());
    res.status(201).json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(admin._id.toString());
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-passwordHash');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
