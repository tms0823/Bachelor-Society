const UserModel = require('../models/userModel');
const ejs = require('ejs');

const UserController = {
  getDashboard: (req, res) => {
    // Clear EJS cache to ensure fresh template compilation
    ejs.clearCache();

    // Render the SaaS dashboard
    const bodyContent = `
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back, <%= user?.name || 'User' %>!</h1>
        <p class="text-gray-600">Here's what's happening in your Bachelor Society community</p>
      </div>

      <!-- Service Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">

        <!-- Housing Card -->
        <div class="service-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl"></span>
            </div>
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Housing</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Find Your Perfect Home</h3>
          <ul class="space-y-2 text-sm text-gray-600 mb-6">
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Advanced filtering by location & price
            </li>
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Professional photo galleries
            </li>
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Direct contact with landlords
            </li>
          </ul>
          <a href="/housing" class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
            <span>Find Housing</span>
            <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
          </a>
        </div>

        <!-- Roommates Card -->
        <div class="service-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl"></span>
            </div>
            <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Roommates</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Connect with Compatible Roommates</h3>
          <ul class="space-y-2 text-sm text-gray-600 mb-6">
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
              Detailed compatibility matching
            </li>
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
              Lifestyle and preference filtering
            </li>
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
              Verified roommate profiles
            </li>
          </ul>
          <a href="/roommates" class="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center">
            <span>Find Roommates</span>
            <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
          </a>
        </div>

        <!-- Activities Card -->
        <div class="service-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl"></span>
            </div>
            <span class="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Activities</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Join Fun Activities & Events</h3>
          <ul class="space-y-2 text-sm text-gray-600 mb-6">
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></span>
              Sports, cultural, and social events
            </li>
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></span>
              Age and interest-based matching
            </li>
            <li class="flex items-center">
              <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></span>
              Easy join/leave functionality
            </li>
          </ul>
          <a href="/buddies" class="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center justify-center">
            <span>Find Activities</span>
            <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
          </a>
        </div>

        <!-- Quick Actions Card -->
        <div class="service-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-lg col-span-1 md:col-span-2 xl:col-span-3">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-2xl"></span>
            </div>
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Quick Actions</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Get Started Fast</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a href="/housing/create" class="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <span class="text-sm font-medium text-gray-700">Post Housing Listing</span>
              <i data-lucide="plus" class="w-5 h-5 text-blue-500"></i>
            </a>
            <a href="/roommates/create" class="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <span class="text-sm font-medium text-gray-700">Create Roommate Request</span>
              <i data-lucide="users" class="w-5 h-5 text-green-500"></i>
            </a>
            <a href="/buddies/create" class="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <span class="text-sm font-medium text-gray-700">Organize an Activity</span>
              <i data-lucide="calendar" class="w-5 h-5 text-purple-500"></i>
            </a>
          </div>
          <div class="text-center">
            <span class="text-xs text-gray-500">Need help? Check our FAQ</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-sm"></span>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">New housing listing posted in your area</p>
              <p class="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-sm"></span>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">Sarah joined your activity group</p>
              <p class="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-sm"></span>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">Weekend hiking trip has 5 new participants</p>
              <p class="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    `;
    const renderedBody = ejs.render(bodyContent, { user: req.user });
    res.render('dashboard', {
      title: 'Dashboard - Bachelor Society',
      user: req.user,
      dashboardBody: renderedBody
    });
  },

  getMe: (req, res) => {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    UserModel.findById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
      const user = results[0];
      delete user.password_hash;
      return res.json({ user });
    });
  },

  updateMe: async (req, res) => {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const allowed = ['username','email','phone','name','age','gender','occupation','preferred_location','budget_min','budget_max','interests'];
      const payload = {};
      allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });

      // Handle profile picture upload if present
      if (req.files && req.files.length > 0) {
        const profilePictureFile = req.files.find(f => f.fieldname === 'profilePicture');
        if (profilePictureFile) {
          // If Cloudinary is configured, upload to cloud, otherwise use local path
          const cloudinary = require('cloudinary').v2;
          const { uploadToCloudinary, handleMultipleUploads } = require("../utils/fileUpload");

          try {
            if (process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET &&
                process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
                process.env.CLOUDINARY_API_KEY !== 'demo_key' &&
                process.env.CLOUDINARY_API_SECRET !== 'demo_secret') {

              // Upload to Cloudinary
              const uploadResult = await uploadToCloudinary(profilePictureFile.path, 'profile-pictures');
              payload.profile_picture = uploadResult.url;
            } else {
              // Use local path for development
              payload.profile_picture = `/uploads/${profilePictureFile.filename}`;
            }
          } catch (uploadError) {
            console.error('Profile picture upload failed:', uploadError);
            // Continue with update even if upload fails
          }
        }
      }

      UserModel.updateById(id, payload, (err, result) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        return res.json({ message: 'Profile updated' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  getPublic: (req, res) => {
    const id = req.params.id;
    UserModel.findById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
      const user = results[0];
      // hide sensitive fields
      delete user.password_hash;
      delete user.email; // optionally hide
      delete user.phone;
      return res.json({ user });
    });
  }
};

module.exports = UserController;
