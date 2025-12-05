const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Simple route handler for the root path
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Register
app.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate input fields
  if (!name || (!email && !phone) || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // If using email, validate email format
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email.' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password.' });
    }

    // Store the user in the database (use email or phone)
    const query = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, phone, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving user' });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  });
});

// User Login (POST /login)
app.post('/login', (req, res) => {
  const { email, phone, password } = req.body;

  if (!(email || phone) || !password) {
    return res.status(400).json({ message: "Please provide email/phone and password." });
  }

  const query = email
    ? "SELECT * FROM users WHERE email = ?"
    : "SELECT * FROM users WHERE phone = ?";

  db.query(query, [email || phone], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Error comparing password" });

      if (!isMatch)
        return res.status(401).json({ message: "Incorrect password" });

      return res.json({
        message: "Login successful!",
        token: "test-token",
        user_id: user.user_id
      });
    });
  });
});

// Create/Update User Profile (POST/PUT /profile)
app.post('/profile', (req, res) => {
  const { user_id, name, age, gender, occupation, location, budget, interests } = req.body;

  // Ensure all required fields are provided
  if (!user_id || !name || !age || !gender || !occupation || !location || !budget || !interests) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Query to insert/update user profile
  const query = 'INSERT INTO profiles (user_id, name, age, gender, occupation, location, budget, interests) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, age = ?, gender = ?, occupation = ?, location = ?, budget = ?, interests = ?';

  db.query(query, [user_id, name, age, gender, occupation, location, budget, interests, name, age, gender, occupation, location, budget, interests], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error saving user profile' });
    }
    res.status(201).json({ message: 'User profile created/updated successfully!' });
  });
});

// Get User Profile (GET /get-profile/:user_id)
app.get("/get-profile/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  db.query("SELECT * FROM profiles WHERE user_id = ?", [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.json({ exists: false });
    }

    return res.json({ exists: true, profile: results[0] });
  });
});

// Check if Profile Exists (GET /check-profile/:user_id)
app.get("/check-profile/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  db.query("SELECT * FROM profiles WHERE user_id = ?", [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

// User Logout (POST /logout)
app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'User logged out successfully!' });
});

// Housing Listing (Insert) (POST /housing)
app.post('/housing', (req, res) => {
  const { title, description, location, rent, num_rooms, user_id } = req.body;

  // Ensure all required fields are provided
  if (!title || !description || !location || !rent || !num_rooms || !user_id) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  // Insert the housing listing into the database
  const query = 'INSERT INTO housing (title, description, location, rent, num_rooms, user_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [title, description, location, rent, num_rooms, user_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error saving housing listing' });
    }
    res.status(201).json({ message: 'Housing listing created successfully!' });
  });
});

// View all Housing Listings Route (GET /housing)
app.get('/housing', (req, res) => {
  const query = 'SELECT * FROM housing';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching housing listings' });
    }
    res.status(200).json(results); // Return all listings as an array
  });
});

// Edit Housing Listing Route (PUT /housing/:id)
app.put('/housing/:id', (req, res) => {
  const { title, description, location, rent, num_rooms } = req.body;
  const { id } = req.params;  // Get housing listing ID from the URL

  // Ensure all fields are provided
  if (!title || !description || !location || !rent || !num_rooms) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  // Update the housing listing in the database
  const query = 'UPDATE housing SET title = ?, description = ?, location = ?, rent = ?, num_rooms = ? WHERE id = ?';
  db.query(query, [title, description, location, rent, num_rooms, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating housing listing' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Housing listing not found' });
    }

    res.status(200).json({ message: 'Housing listing updated successfully!' });
  });
});

// Delete Housing Listing Route (DELETE /housing/:id)
app.delete('/housing/:id', (req, res) => {
  const { id } = req.params;  // Get housing listing ID from the URL

  // Delete the housing listing from the database
  const query = 'DELETE FROM housing WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting housing listing' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Housing listing not found' });
    }

    res.status(200).json({ message: 'Housing listing deleted successfully!' });
  });
});

// Start server
app.listen(4000, () => {
  console.log('🚀 Server started on http://localhost:4000');
});

