const BuddyModel = require('../models/buddyModel');
const UserModel = require('../models/userModel');
const { handleMultipleUploads, deleteFromCloudinary } = require("../utils/fileUpload");

const BuddyController = {
  create: async (req, res) => {
    try {
      const owner_id = req.user.id;
      let {
        activity_type, location, address, date_time, description, max_participants,
        gender_preference, min_age, max_age, cost_per_person, is_private
      } = req.body;

      if (!activity_type || !location || !date_time) {
        return res.status(400).json({ message: "Required fields: activity_type, location, date_time" });
      }

      if (Number.isNaN(Date.parse(date_time))) return res.status(400).json({ message: "date_time must be a valid date" });

      let photos = null;

        // Handle photo uploads if files are present
        if (req.files && req.files.length > 0) {
          try {
            const uploadedPhotos = await handleMultipleUploads(req.files, 'buddies');
            photos = uploadedPhotos;
          } catch (uploadError) {
            return res.status(500).json({ message: "Failed to upload photos", error: uploadError.message });
          }
        }

      const buddyData = {
        owner_id, activity_type, location, address, date_time, description,
        max_participants: max_participants || 10,
        gender_preference: gender_preference || 'any',
        min_age: min_age || 18,
        max_age: max_age || 99,
        cost_per_person: cost_per_person || 0,
        photos: photos ? JSON.stringify(photos) : null,
        is_private: is_private || false
      };

      BuddyModel.create(buddyData, (err, result) => {
        if (err) {
          // Clean up uploaded photos if database insert fails
          if (photos) {
            const fs = require('fs');
            const path = require('path');
            photos.forEach(photo => {
              if (photo.url) {
                const filename = photo.url.split('/').pop();
                const filePath = path.join('uploads', filename);
                try {
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                  }
                } catch (fileErr) {
                  console.error('Error cleaning up photo file:', fileErr);
                }
              }
            });
          }
          return res.status(500).json({ message: "Failed to create buddy post", error: err });
        }

        return res.status(201).json({
          message: "Buddy post created successfully",
          id: result.insertId,
          photos: photos
        });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  list: (req, res) => {
    // Try to authenticate user even on this public route
    let user = null;
    try {
      // Check for token in various places - prioritize query params for debugging
      let token = req.query.token || null;

      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.slice(7);
      }

      if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

      if (token) {
        const jwtHelper = require('../utils/jwtHelper');
        const decoded = jwtHelper.verify(token);
        user = decoded;
      }
    } catch (e) {
      // Token invalid, user remains null
    }

    const filters = {
      activity_type: req.query.activity_type,
      location: req.query.location,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      time_from: req.query.time_from,
      time_to: req.query.time_to,
      gender_preference: req.query.gender_preference,
      max_participants: req.query.max_participants,
      min_age: req.query.min_age,
      max_age: req.query.max_age,
      cost_min: req.query.cost_min,
      cost_max: req.query.cost_max,
      q: req.query.q,
      user_id: req.user?.id,
      owner: req.query.owner === 'true'
    };

    BuddyModel.list(filters, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ buddies: results });
    });
  },

  get: (req, res) => {
    const id = req.params.id;

    // Try to authenticate user even on this public route
    let user = null;
    try {
      // Check for token in various places - prioritize query params for debugging
      let token = req.query.token || null;

      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.slice(7);
      }

      if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

      if (token) {
        const jwtHelper = require('../utils/jwtHelper');
        const decoded = jwtHelper.verify(token);
        user = decoded;
      }
    } catch (e) {
      // Token invalid, user remains null
    }

    BuddyModel.findById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });

      const buddy = results[0];
      const is_owner = user && user.id == buddy.owner_id;

      // Check if user has joined this activity
      let has_joined = false;
      if (user && !is_owner) {
        BuddyModel.isParticipating(id, user.id, (err2, participationResults) => {
          if (!err2 && participationResults && participationResults.length > 0) {
            has_joined = true;
          }

          return res.json({
            buddy: {
              ...buddy,
              is_owner,
              has_joined
            }
          });
        });
      } else {
        return res.json({
          buddy: {
            ...buddy,
            is_owner,
            has_joined
          }
        });
      }
    });
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      // Find the listing first
      BuddyModel.findById(id, async (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
        const listing = results[0];
        // Ensure authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        if (listing.owner_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        let photos = listing.photos; // Keep existing photos by default

        // Parse existing photos if it's a string
        let existingPhotos = [];
        if (listing.photos) {
          if (typeof listing.photos === 'string') {
            try {
              existingPhotos = JSON.parse(listing.photos);
            } catch (e) {
              existingPhotos = [];
            }
          } else {
            existingPhotos = listing.photos;
          }
        }

        // Handle photo uploads if files are present
        if (req.files && req.files.length > 0) {
          try {
            const uploadedPhotos = await handleMultipleUploads(req.files, 'buddies');
            // Merge existing photos with new ones instead of replacing
            photos = [...existingPhotos, ...uploadedPhotos];
          } catch (uploadError) {
            return res.status(500).json({ message: "Failed to upload photos", error: uploadError.message });
          }
        } else {
          photos = existingPhotos;
        }

        const updateData = { ...req.body };
        if (photos !== undefined) {
          updateData.photos = JSON.stringify(photos);
        }

        // Convert checkbox values to boolean
        if (updateData.is_private === 'on') updateData.is_private = true;
        if (updateData.is_private === 'off' || !updateData.is_private) updateData.is_private = false;

        // Convert empty strings to null for numeric fields
        if (updateData.max_participants === '') updateData.max_participants = null;
        if (updateData.min_age === '') updateData.min_age = null;
        if (updateData.max_age === '') updateData.max_age = null;
        if (updateData.cost_per_person === '') updateData.cost_per_person = null;

        // Convert string numbers to actual numbers
        if (updateData.max_participants) updateData.max_participants = parseInt(updateData.max_participants);
        if (updateData.min_age) updateData.min_age = parseInt(updateData.min_age);
        if (updateData.max_age) updateData.max_age = parseInt(updateData.max_age);
        if (updateData.cost_per_person) updateData.cost_per_person = parseFloat(updateData.cost_per_person);

        BuddyModel.update(id, updateData, (err2, result) => {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
          return res.json({ message: 'Updated', result, photos });
        });
      });
    } catch (e) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  remove: (req, res) => {
    const id = req.params.id;
    BuddyModel.findById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
      const post = results[0];
      if (!req.user || req.user.id !== post.owner_id) return res.status(403).json({ message: 'Forbidden' });
      BuddyModel.delete(id, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'DB error' });
        return res.json({ message: 'Deleted', result });
      });
    });
  },

  // Join a buddy activity
  join: (req, res) => {
    const buddyId = req.params.id;
    const userId = req.user.id;

    // Check if buddy exists
    BuddyModel.findById(buddyId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Buddy activity not found' });

      const buddy = results[0];

      // Prevent owner from joining their own activity
      if (buddy.owner_id === userId) {
        return res.status(400).json({ message: 'You cannot join your own activity' });
      }

      // Check if user is already participating
      BuddyModel.isParticipating(buddyId, userId, (err2, participationResults) => {
        if (err2) return res.status(500).json({ message: 'DB error' });

        if (participationResults && participationResults.length > 0) {
          return res.status(400).json({ message: 'Already joined this activity' });
        }

        // Join the activity
        BuddyModel.joinBuddy(buddyId, userId, (err3, result) => {
          if (err3) return res.status(500).json({ message: 'Failed to join activity' });

          return res.json({ message: 'Successfully joined the activity!' });
        });
      });
    });
  },

  // Leave a buddy activity
  leave: (req, res) => {
    const buddyId = req.params.id;
    const userId = req.user.id;

    // First check if the user is actually participating
    BuddyModel.isParticipating(buddyId, userId, (err, participationResults) => {
      if (err) return res.status(500).json({ message: 'DB error' });

      if (!participationResults || participationResults.length === 0) {
        return res.status(400).json({ message: 'You are not participating in this activity' });
      }

      BuddyModel.leaveBuddy(buddyId, userId, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'DB error' });
        return res.json({ message: 'Successfully left the activity' });
      });
    });
  },

  // Get participants for a buddy activity
  getParticipants: (req, res) => {
    const buddyId = req.params.id;

    BuddyModel.getParticipants(buddyId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      return res.json({ participants: results });
    });
  }
};

module.exports = BuddyController;
