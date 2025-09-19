const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const app = express();
console.log("SERVER BOOTING UP...");

// ----------------- CORS Setup -----------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://greenquest-1.onrender.com",
  "https://greenquest-kappa.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
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

// =================================================================
// ----------------- SCHEMAS & MODELS ------------------------------
// =================================================================

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
  redeemedRewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }],
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const adminSchema = new mongoose.Schema({
  idNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: { type: String, enum: ['plastic', 'organic', 'e-waste', 'biodegradable', 'ecofriendly'], required: true },
  weight: { type: Number, required: true },
  points: { type: Number, required: true },
  collectedBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Collection = mongoose.model('Collection', collectionSchema);

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

const rewardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number, required: true },
    type: {
        type: String,
        enum: ['Discount', 'Voucher', 'Recharge', 'Product'],
        required: true,
    },
    requiredLevel: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const Reward = mongoose.model('Reward', rewardSchema);

const redemptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
    pointsSpent: { type: Number, required: true },
}, { timestamps: true });
const Redemption = mongoose.model('Redemption', redemptionSchema);

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);


// =================================================================
// ----------------- TIER DEFINITIONS ------------------------------
// =================================================================

const tiers = [
    { level: 1, name: 'Eco-Starter', minPoints: 0 },
    { level: 2, name: 'Green-Guardian', minPoints: 100 },
    { level: 3, name: 'Eco-Champion', minPoints: 300 },
    { level: 4, name: 'Planet-Hero', minPoints: 700 },
    { level: 5, name: 'Eco-Legend', minPoints: 5000 },
    { level: 6, name: 'Terra-Guardian', minPoints: 20000 },
    { level: 7, name: 'Gaia\'s Champion', minPoints: 50000 },
];


// =================================================================
// ----------------- AUTH MIDDLEWARE -------------------------------
// =================================================================

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

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};


// =================================================================
// ----------------- API ROUTES ------------------------------------
// =================================================================

// --- Auth Routes ---
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
      user: { id: user._id, fullName: user.fullName, phone: user.phone, username: user.username, village: user.village, points: user.points, level: user.level, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let account = role === 'admin'
      ? await Admin.findOne({ idNumber: username })
      : await User.findOne({ $or: [{ phone: username }, { username }] });
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
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// --- User & Stats Routes ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const distinctVillages = await User.distinct('village');
        const collectionStats = await Collection.aggregate([
            { $group: { _id: null, totalWaste: { $sum: '$weight' }, totalRewards: { $sum: '$points' } } }
        ]);
        res.json({ 
            households: totalUsers, 
            villages: distinctVillages.length, 
            wasteReduction: collectionStats[0]?.totalWaste || 0, 
            rewards: collectionStats[0]?.totalRewards || 0 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

// --- Pickup Routes ---
app.post('/api/pickups', authenticateToken, async (req, res) => {
  try {
    const { wasteTypes, quantity, address, pickupDate, timeSlot } = req.body;
    const pickup = new Pickup({ user: req.user.userId, wasteTypes, quantity, address, pickupDate, timeSlot });
    await pickup.save();
    res.status(201).json({ message: 'Pickup scheduled successfully!', pickup });
  } catch (error) {
    res.status(500).json({ message: 'Server error during pickup scheduling' });
  }
});

app.get('/api/pickups/my-pickups', authenticateToken, async (req, res) => {
  try {
    const pickups = await Pickup.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching pickups' });
  }
});

// --- Reward & Leaderboard Routes ---
app.get('/api/rewards', async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ pointsRequired: 1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching rewards' });
  }
});

app.post('/api/rewards/redeem', authenticateToken, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const user = await User.findById(req.user.userId);
    const reward = await Reward.findById(rewardId);

    if (!reward) return res.status(404).json({ message: 'Reward not found.' });
    if (user.redeemedRewards && user.redeemedRewards.includes(rewardId)) {
      return res.status(400).json({ message: 'You have already redeemed this reward.' });
    }
    if (user.points < reward.pointsRequired) {
      return res.status(400).json({ message: 'Insufficient points.' });
    }

    user.points -= reward.pointsRequired;
    if (!user.redeemedRewards) user.redeemedRewards = [];
    user.redeemedRewards.push(rewardId);

    const redemption = new Redemption({
      user: user._id,
      reward: reward._id,
      pointsSpent: reward.pointsRequired,
    });

    const notification = new Notification({
      user: user._id,
      message: `Success! You've redeemed "${reward.title}" for ${reward.pointsRequired} points.`,
      link: '/rewards',
    });

    await Promise.all([user.save(), redemption.save(), notification.save()]);

    if (user.email) {
      const emailMessage = {
        to: user.email,
        from: 'ashmi.sn2004@gmail.com',
        subject: 'Reward Redemption Successful!',
        text: `You successfully redeemed "${reward.title}" for ${reward.pointsRequired} points.`,
        html: `<p>Hi ${user.name || 'User'},</p>
               <p>Success! You've redeemed <b>${reward.title}</b> for ${reward.pointsRequired} points.</p>
               <p>Remaining points: ${user.points}</p>`,
      };

      sgMail
        .send(emailMessage)
        .catch((error) =>
          console.error('Error sending email:', error.response?.body || error.message)
        );
    }

    res.json({
      message: `Successfully redeemed '${reward.title}'!`,
      updatedPoints: user.points,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while redeeming reward' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'user' }).sort({ points: -1 }).limit(10).select('fullName village points level');
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
});

// --- Notification Routes ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

app.post('/api/notifications/mark-read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.userId, isRead: false }, { $set: { isRead: true } });
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Game Routes ---
app.post('/api/users/add-game-points', authenticateToken, async (req, res) => {
    try {
        const { pointsToAdd, gameName } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const pointsBefore = user.points;
        user.points += pointsToAdd;

        const tierBefore = tiers.slice().reverse().find(t => pointsBefore >= t.minPoints) || tiers[0];
        const tierAfter = tiers.slice().reverse().find(t => user.points >= t.minPoints) || tiers[0];

        const notificationPromises = [];
        if (tierAfter.level > tierBefore.level) {
            const levelUpMessage = `LEVEL UP! You've reached Tier ${tierAfter.level}: ${tierAfter.name}!`;
            notificationPromises.push(new Notification({ user: user._id, message: levelUpMessage, link: '/dashboard' }).save());
        }
        
        const gameWinMessage = `Congratulations! You earned ${pointsToAdd} bonus points from playing ${gameName}.`;
        notificationPromises.push(new Notification({ user: user._id, message: gameWinMessage, link: '/games' }).save());
        
        await Promise.all([user.save(), ...notificationPromises]);
        res.json({ message: 'Points added successfully!', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding game points' });
    }
});

// --- Admin Routes ---
app.post('/api/assign-points', [authenticateToken, authorizeAdmin], async (req, res) => {
    try {
        const { phone, wasteType, weight } = req.body;
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const pointsBefore = user.points;
        let pointsPerKg = 10, bonusMultiplier = 1.0, bonusMessage = '';
        if (wasteType === 'plastic') {
            const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
            const fifteenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 15));
            const recentCollections = await Collection.find({ userId: user._id, wasteType: 'plastic', date: { $gte: thirtyDaysAgo } });
            const firstHalfWeight = recentCollections.filter(c => c.date < fifteenDaysAgo).reduce((sum, c) => sum + c.weight, 0);
            const secondHalfWeight = recentCollections.filter(c => c.date >= fifteenDaysAgo).reduce((sum, c) => sum + c.weight, 0);
            if (firstHalfWeight > 0 && secondHalfWeight < firstHalfWeight) {
                bonusMultiplier = 1.2;
                bonusMessage = ' Great job reducing plastic waste! You earned a 20% bonus.';
            }
        }
        else if (wasteType === 'biodegradable') pointsPerKg = 15;
        else if (wasteType === 'e-waste') pointsPerKg = 25;
        
        const pointsEarned = Math.round((weight * pointsPerKg) * bonusMultiplier);
        user.points += pointsEarned;
        
        const notificationPromises = [];
        const tierBefore = tiers.slice().reverse().find(t => pointsBefore >= t.minPoints) || tiers[0];
        const tierAfter = tiers.slice().reverse().find(t => user.points >= t.minPoints) || tiers[0];
        if (tierAfter.level > tierBefore.level) {
            const levelUpMessage = `LEVEL UP! You've reached Tier ${tierAfter.level}: ${tierAfter.name}!`;
            notificationPromises.push(new Notification({ user: user._id, message: levelUpMessage, link: '/dashboard' }).save());
        }

        const pointsMessage = `You earned ${pointsEarned} points for your ${wasteType} collection.${bonusMessage}`;
        notificationPromises.push(new Notification({ user: user._id, message: pointsMessage }).save());
        
        const newCollection = new Collection({ userId: user._id, wasteType, weight, points: pointsEarned, collectedBy: req.user.idNumber || 'admin' });
        
        await Promise.all([user.save(), newCollection.save(), ...notificationPromises]);
        res.json({ message: `Points assigned successfully.${bonusMessage}`, points: pointsEarned, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error while assigning points' });
    }
});

app.get('/api/pickups/all', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const allPickups = await Pickup.find({})
      .populate('user', 'fullName phone') // Attaches the user's name and phone
      .sort({ createdAt: -1 });           // Shows the newest requests first
    
    res.json(allPickups);
  } catch (error) {
    console.error("Admin: Error fetching all pickups:", error);
    res.status(500).json({ message: 'Server error while fetching all pickups' });
  }
});
app.put('/api/pickups/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate the incoming status value
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value provided.' });
    }

    // Find the pickup and update its status
    const pickup = await Pickup.findById(id);
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found.' });
    }
    pickup.status = status;
    await pickup.save();

    // Create an in-app notification for the user
    const message = `Update: Your pickup scheduled for ${new Date(pickup.pickupDate).toLocaleDateString()} is now marked as "${status}".`;
    const newNotification = new Notification({
        user: pickup.user,
        message: message,
        link: '/dashboard'
    });
    await newNotification.save();

    res.json({ message: `Pickup status successfully updated to ${status}`, pickup });
  } catch (error) {
    console.error("Admin: Error updating pickup status:", error);
    res.status(500).json({ message: 'Server error while updating pickup status' });
  }
});app.put('/api/pickups/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate the incoming status value
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value provided.' });
    }

    // Find the pickup and update its status
    const pickup = await Pickup.findById(id);
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found.' });
    }
    pickup.status = status;
    await pickup.save();

    // Create an in-app notification for the user
    const message = `Update: Your pickup scheduled for ${new Date(pickup.pickupDate).toLocaleDateString()} is now marked as "${status}".`;
    const newNotification = new Notification({
        user: pickup.user,
        message: message,
        link: '/dashboard'
    });
    await newNotification.save();

    res.json({ message: `Pickup status successfully updated to ${status}`, pickup });
  } catch (error) {
    console.error("Admin: Error updating pickup status:", error);
    res.status(500).json({ message: 'Server error while updating pickup status' });
  }
});
// =================================================================
// ----------------- SERVER INITIALIZATION -------------------------
// =================================================================

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});