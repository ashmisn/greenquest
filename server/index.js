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

// --- NEWLY ADDED --- Pickup Schema
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

// --- NEWLY ADDED --- Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// ----------------- Routes -----------------

// Register User
app.post('/api/register', async (req, res) => {
  // ... your existing registration code ...
});

// Login User/Admin
app.post('/api/login', async (req, res) => {
  // ... your existing login code ...
});

// --- NEWLY ADDED --- Get Profile Route
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

// --- NEWLY ADDED --- Get Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        // You can add more complex logic here later
        res.json({
            totalUsers: totalUsers,
            villagesImpacted: 25, // placeholder
            wasteReducedKg: 5820   // placeholder
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

// --- NEWLY ADDED --- Assign Points Route
app.post('/api/assign-points', [authenticateToken, authorizeAdmin], async (req, res) => {
    try {
        const { phone, wasteType, weight } = req.body;
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User with that phone number not found.' });
        }

        let pointsPerKg = 10; // default for plastic
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
  // ... your existing admin creation code ...
};

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});