const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, getJwtSecret } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    if (role && (role === 'admin' || role === 'seller')) {
      return res.status(400).json({ error: 'Public registration for admin or seller accounts is disallowed.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: 'buyer',
      city: city || '',
      authProvider: 'local'
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        picture: user.picture,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        picture: user.picture,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { email, name, picture, provider } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for social authentication.' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        role: 'buyer',
        picture: picture || '',
        authProvider: provider || 'google'
      });
      await user.save();
    } else {
      if (picture && !user.picture) {
        user.picture = picture;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        picture: user.picture,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Server error during social login.' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { name, phone, city, picture } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (city !== undefined) user.city = city.trim();
    if (picture) user.picture = picture.trim();

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        picture: user.picture,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        picture: user.picture,
        authProvider: user.authProvider,
        savedCars: user.savedCars || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/saved — get the signed-in user's saved car IDs
router.get('/saved', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const user = await User.findById(userId).select('savedCars');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ saved: user.savedCars || [] });
  } catch (error) {
    console.error('Get saved error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/auth/saved — replace the signed-in user's saved car IDs (per-account, stored in MongoDB)
router.put('/saved', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const ids = Array.isArray(req.body.saved)
      ? req.body.saved.filter((x) => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
      : [];
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.savedCars = ids;
    await user.save();
    res.json({ saved: user.savedCars });
  } catch (error) {
    console.error('Save cars error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
