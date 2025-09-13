const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Log to confirm the new version is running after deployment
console.log("SERVER BOOTING UP with diagnostic logging for CORS.");

// ----------------- CORS Setup with Diagnostic Logging -----------------
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://greenquest-1.onrender.com", // old deployed frontend
  "https://greenquest-kappa.vercel.app" // NEW Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("-----------------------------------------");
    console.log("CORS MIDDLEWARE TRIGGERED");
    console.log("Request came from origin:", origin);

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log("CORS check PASSED for this origin.");
      callback(null, true);
    } else {
      console.log("CORS check FAILED. Origin not in the allowed list.");
      callback(new Error('This origin is not allowed by CORS'));
    }
    console.log("-----------------------------------------");
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ----------------- Middleware -----------------
app.use(express.json());

// ----------------- MongoDB Connection -----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ----------------- Schemas & Models -----------------

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  username: { type: String, required: true },
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

// Pickup Schema
const pickupSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wasteTypes: { type: [String], required: true },
    quantity: { type: String, required: true },
    address: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
}, { timestamps: true });
const Pickup = mongoose.model('Pickup', pickupSchema);


// ----------------- Auth Middleware -----------------
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

// --- THIS IS THE MISSING FUNCTION ---
const authorizeAdmin = (req, res, next) => {
  // This function should run AFTER authenticateToken, so req.user will exist
  if (req.user && req.user.role === 'admin') {
    next(); // If the user's role is 'admin', allow the request to continue
  } else {
    // If the user's role is not admin, block the request
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};


// ----------------- Routes -----------------

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phone, username, email, village, householdSize, address, password } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });
    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) return res.status(400).json({ message: 'User with this phone number already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, phone, username, email, village, householdSize, address, password: hashedPassword });
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

// Get Profile Route
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// Get Stats Route
// Get Stats Route
// app.get('/api/stats', async (req, res) => {
//     try {
//         const totalUsers = await User.countDocuments();
        
//         // --- FIX: Changed the keys to match the front-end Stats interface ---
//         res.json({
//             households: totalUsers,
//             villages: 25,             // placeholder value
//             wasteReduction: 5820,     // placeholder value
//             rewards: 320              // Added missing rewards key with a placeholder
//         });
app.get('/api/stats', async (req, res) => {
    try {
        // --- MODIFIED: Added real database calculations for all stats ---

        // 1. Get the total number of registered users (real-time)
        const totalUsers = await User.countDocuments();

        // 2. Get the number of unique villages covered (real-time)
        const distinctVillages = await User.distinct('village');
        const villagesImpacted = distinctVillages.length;

        // 3. Calculate total waste reduction and rewards using an aggregation pipeline (real-time)
        const collectionStats = await Collection.aggregate([
            {
                $group: {
                    _id: null, // Group all documents into one
                    totalWaste: { $sum: '$weight' }, // Sum up the 'weight' field
                    totalRewards: { $sum: '$points' } // Sum up the 'points' field
                }
            }
        ]);

        const wasteReducedKg = collectionStats[0]?.totalWaste || 0;
        const rewardsDistributed = collectionStats[0]?.totalRewards || 0;

        // Send the real data with the correct keys
        res.json({
            households: totalUsers,
            villages: villagesImpacted,
            wasteReduction: wasteReducedKg,
            rewards: rewardsDistributed
        });
        
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

// Assign Points Route
app.post('/api/assign-points', [authenticateToken, authorizeAdmin], async (req, res) => {
    try {
        const { phone, wasteType, weight } = req.body;
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User with that phone number not found.' });
        }
        let pointsPerKg = 10;
        if (wasteType === 'biodegradable') pointsPerKg = 15;
        if (wasteType === 'e-waste') pointsPerKg = 25;
        const pointsEarned = Math.round(weight * pointsPerKg);
        user.points += pointsEarned;
        await user.save();
        res.json({ message: 'Points assigned successfully', points: pointsEarned, user });
    } catch (error) {
        console.error("Assign Points Error:", error);
        res.status(500).json({ message: 'Server error while assigning points' });
    }
});

// Schedule a new pickup (Protected Route)
app.post('/api/pickups', authenticateToken, async (req, res) => {
  try {
    const { wasteTypes, quantity, address, pickupDate, timeSlot } = req.body;
    if (!wasteTypes || !quantity || !address || !pickupDate || !timeSlot) {
      return res.status(400).json({ message: 'Please provide all required fields for the pickup.' });
    }
    const pickup = new Pickup({
      user: req.user.userId,
      wasteTypes,
      quantity,
      address,
      pickupDate,
      timeSlot,
    });
    await pickup.save();
    res.status(201).json({ message: 'Pickup scheduled successfully!', pickup });
  } catch (error) {
    console.error("Schedule Pickup Error:", error);
    res.status(500).json({ message: 'Server error during pickup scheduling', error: error.message });
  }
});

// Get all pickups for the logged-in user (Protected Route)
app.get('/api/pickups/my-pickups', authenticateToken, async (req, res) => {
  try {
    const pickups = await Pickup.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(pickups);
  } catch (error) {
    console.error("Get User Pickups Error:", error);
    res.status(500).json({ message: 'Server error while fetching pickups', error: error.message });
  }
});

// Get ALL pickup requests (Admin Only)
app.get('/api/pickups/all', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const allPickups = await Pickup.find({})
      .populate('user', 'fullName phone')
      .sort({ createdAt: -1 });
    res.json(allPickups);
  } catch (error) {
    console.error("Admin Get All Pickups Error:", error);
    res.status(500).json({ message: 'Server error while fetching all pickups', error: error.message });
  }
});

// Update a pickup's status (Admin Only)
app.put('/api/pickups/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found.' });
    }
    pickup.status = status;
    await pickup.save();
    res.json({ message: `Pickup status updated to ${status}`, pickup });
  } catch (error) {
    console.error("Admin Update Pickup Error:", error);
    res.status(500).json({ message: 'Server error while updating pickup status', error: error.message });
  }
});

// ----------------- Create Default Admin -----------------
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

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});
