const UserModel = require('../models/userModel');
const jwtHelper = require('../utils/jwtHelper');
const bcrypt = require('bcryptjs');

const AuthController = {
  // Login user
  login: async (req, res) => {
    try {
      console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });

      const { email, password } = req.body;

      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      UserModel.findByEmail(email, async (err, results) => {
        console.log('Database query result:', { err: !!err, resultsCount: results ? results.length : 0 });

        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (!results || results.length === 0) {
          console.log('User not found');
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        console.log('Found user:', user.username);

        // Check password
        console.log('Checking password...');
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwtHelper.sign({ id: user.id, username: user.username, role: user.role });
        console.log('Token generated, length:', token.length);

        try {
          res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            sameSite: 'lax'
          });
          console.log('Cookie set successfully');
        } catch (error) {
          console.error('Error setting cookie:', error);
        }

        return res.status(200).json({
          message: "Login successful",
          token,
          user: { id: user.id, username: user.username, email: user.email }
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Register user
  register: async (req, res) => {
    try {
      console.log('Register attempt, req.body:', req.body);
      console.log('Register attempt, req.file:', req.file);
      const { username, email, password, phone } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      // Check if user already exists
      UserModel.findByEmail(email, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (results && results.length > 0) {
          return res.status(409).json({ message: 'User already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Handle profile picture upload
        let profilePictureUrl = null;
        const profilePictureFile = req.files ? req.files.find(f => f.fieldname === 'profilePicture') : null;

        if (profilePictureFile) {
          // If Cloudinary is configured, upload to cloud, otherwise use local path
          const cloudinary = require('cloudinary').v2;
          const { uploadToCloudinary, handleMultipleUploads } = require('../utils/fileUpload');

          try {
            if (process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET &&
                process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
                process.env.CLOUDINARY_API_KEY !== 'demo_key' &&
                process.env.CLOUDINARY_API_SECRET !== 'demo_secret') {

              // Upload to Cloudinary
              const uploadResult = await uploadToCloudinary(profilePictureFile.path, 'profile-pictures');
              profilePictureUrl = uploadResult.url;
            } else {
              // Use local path for development
              profilePictureUrl = `/uploads/${profilePictureFile.filename}`;
            }
          } catch (uploadError) {
            console.error('Profile picture upload failed:', uploadError);
            // Continue with registration even if upload fails
          }
        }

        const userData = {
          username,
          email,
          phone,
          password_hash: hashedPassword,
          profile_picture: profilePictureUrl
        };

        UserModel.createUser(userData, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to create user' });
          }

          // Auto-login after registration
          const token = jwtHelper.sign({ id: result.insertId, username, role: 'user' });

          res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
            sameSite: 'lax'
          });

          return res.status(201).json({ message: 'User created successfully', token });
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Logout user
  logout: (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
  },

  // Get current user
  getCurrentUser: (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(200).json({ user: req.user });
  }
};

module.exports = AuthController;
