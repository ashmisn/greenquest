
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
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
  collectedBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Collection = mongoose.model('Collection', collectionSchema);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phone, email, village, householdSize, address, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullName,
      phone,
      email,
      village,
      householdSize,
      address,
      password: hashedPassword
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        village: user.village,
        points: user.points,
        level: user.level,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ idNumber: username });
    } else {
      user = await User.findOne({ phone: username });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseUser = role === 'admin' 
      ? { id: user._id, idNumber: user.idNumber, name: user.name, role: 'admin' }
      : { 
          id: user._id, 
          fullName: user.fullName, 
          phone: user.phone, 
          village: user.village, 
          points: user.points, 
          level: user.level, 
          role: 'user' 
        };

    res.json({
      message: 'Login successful',
      token,
      user: responseUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCollections = await Collection.countDocuments();
    const villages = await User.distinct('village');
    const totalWaste = await Collection.aggregate([
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);

    res.json({
      households: totalUsers,
      villages: villages.length,
      wasteReduction: totalWaste[0]?.total || 0,
      rewards: totalUsers * 10 // Mock calculation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create default admin
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ idNumber: 'admin123' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        idNumber: 'admin123',
        password: hashedPassword,
        name: 'Default Admin'
      });
      await admin.save();
      console.log('Default admin created: admin123 / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

app.post('/api/assign-points', authenticateToken, async (req, res) => {
  try {
    // Only allow admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can assign points' });
    }
    const { phone, wasteType, weight } = req.body;
    if (!phone || !wasteType || !weight) {
      return res.status(400).json({ message: 'phone, wasteType, and weight are required' });
    }
    // Points per kg by waste type
    const pointsTable = {
      plastic: 10,
      organic: 15, // Corrected from `biodegradable` to match schema
      ecofriendly: 25 // Corrected from `e-waste` to match schema
    };
    const typeKey = wasteType.toLowerCase();
    if (!pointsTable[typeKey]) {
      return res.status(400).json({ message: 'Invalid waste type' });
    }
    const points = pointsTable[typeKey] * Number(weight);
    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update user points
    user.points += points;
    await user.save();
    // Add collection record
    await Collection.create({
      userId: user._id,
      wasteType: typeKey,
      weight,
      points,
      collectedBy: req.user.idNumber || req.user.name || 'admin'
    });
    res.json({ message: 'Points assigned successfully', points, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});