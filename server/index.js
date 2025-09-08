const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // primary unique key
  username: { type: String, required: true }, // mandatory, not unique
  email: { type: String },
  village: { type: String, required: true },
  householdSize: { type: String, required: true },
  address: { type: String, required: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  idNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Collection Schema
const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: { type: String, enum: ['plastic', 'organic', 'ecofriendly'], required: true },
  weight: { type: Number, required: true },
  points: { type: Number, required: true },
  collectedBy: { type: String, required: true }, // admin idNumber
  date: { type: Date, default: Date.now }
});

const Collection = mongoose.model('Collection', collectionSchema);

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = decoded;
    next();
  });
};

// --- Routes ---

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phone, username, email, village, householdSize, address, password } = req.body;

    if (!username) return res.status(400).json({ message: 'Username is required' });

    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) return res.status(400).json({ message: 'User with this phone number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      phone,
      username, // mandatory, not unique
      email,
      village,
      householdSize,
      address,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        username: user.username,
        village: user.village,
        points: user.points,
        level: user.level,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login User/Admin
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let account;
    if (role === 'admin') {
      account = await Admin.findOne({ idNumber: username });
    } else {
      // Login using either phone or username
      account = await User.findOne({ $or: [{ phone: username }, { username }] });
    }

    if (!account) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = role === 'admin'
      ? { userId: account._id, role: 'admin', idNumber: account.idNumber }
      : { userId: account._id, role: 'user' };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userData = role === 'admin'
      ? { id: account._id, idNumber: account.idNumber, name: account.name, role: 'admin' }
      : { id: account._id, fullName: account.fullName, phone: account.phone, username: account.username, village: account.village, points: account.points, level: account.level, role: 'user' };

    res.json({ message: 'Login successful', token, user: userData });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// --- Create Default Admin ---
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ idNumber: 'admin123' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({ idNumber: 'admin123', password: hashedPassword, name: 'Default Admin' });
      await admin.save();
      console.log('Default admin created: admin123 / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});
