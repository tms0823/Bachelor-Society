const RoommateModel = require('../models/roommateModel');
const { handleMultipleUploads, deleteFromCloudinary } = require("../utils/fileUpload");

const RoommateController = {
  create: async (req, res) => {
    try {
      const owner_id = req.user?.id || null;
      const {
        preferred_location, budget_min, budget_max, lifestyle, move_in_date, description,
        gender_preference, room_type, lease_duration_preference, occupation,
        smoking_preference, religion, pet_preference, max_roommates, is_private
      } = req.body;

      if (!preferred_location) return res.status(400).json({ message: 'preferred_location required' });
      if (budget_min !== undefined && (isNaN(Number(budget_min)) || Number(budget_min) < 0)) return res.status(400).json({ message: 'budget_min must be a non-negative number' });
      if (budget_max !== undefined && (isNaN(Number(budget_max)) || Number(budget_max) < 0)) return res.status(400).json({ message: 'budget_max must be a non-negative number' });
      if (budget_min !== undefined && budget_max !== undefined && Number(budget_min) > Number(budget_max)) return res.status(400).json({ message: 'budget_min cannot exceed budget_max' });
      if (move_in_date !== undefined && Number.isNaN(Date.parse(move_in_date))) return res.status(400).json({ message: 'move_in_date must be a valid date' });

      let photos = null;

      // Handle photo uploads if files are present
      if (req.files && req.files.length > 0) {
        try {
          const uploadedPhotos = await handleMultipleUploads(req.files, 'roommates');
          photos = uploadedPhotos;
        } catch (uploadError) {
          return res.status(500).json({ message: "Failed to upload photos", error: uploadError.message });
        }
      }

      const roommateData = {
        owner_id, preferred_location, budget_min, budget_max, lifestyle, move_in_date, description,
        gender_preference: gender_preference || 'any',
        room_type: room_type || 'any',
        lease_duration_preference: lease_duration_preference || 12,
        occupation,
        smoking_preference: smoking_preference || 'any',
        religion,
        pet_preference: pet_preference || 'any_pets',
        max_roommates: max_roommates || 1,
        photos: photos ? JSON.stringify(photos) : null,
        is_private: is_private || false
      };

      RoommateModel.create(roommateData, (err, result) => {
        if (err) {
          // Clean up uploaded photos if database insert fails
          if (photos) {
            photos.forEach(photo => deleteFromCloudinary(photo.public_id));
          }
          return res.status(500).json({ message: 'DB error' });
        }

        return res.status(201).json({
          message: 'Roommate request created',
          id: result.insertId,
          photos: photos
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  list: (req, res) => {
    // Try to authenticate user even on this public route
    let user = null;
    try {
      // Check for token in various places
      let token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

      if (!token && req.query.token) token = req.query.token;
      if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

      if (token) {
        const jwtHelper = require('../utils/jwtHelper');
        const decoded = jwtHelper.verify(token);
        user = decoded;
      }
    } catch (e) {
      // Token invalid, user remains null
    }

    // Require authentication for owner-specific queries
    console.log('Owner query check:', req.query.owner, typeof req.query.owner, 'User:', user ? user.id : 'null');
    if (req.query.owner === 'true') {
      if (!user) {
        console.log('Owner query without authentication - rejecting');
        return res.status(401).json({ message: 'Authentication required for owner queries' });
      }
      console.log('Owner query with user:', user.id);
    } else {
      console.log('Not an owner query, req.query.owner =', req.query.owner);
    }

    try {
      const filters = {
        preferred_location: req.query.preferred_location,
        budget_min: req.query.budget_min,
        budget_max: req.query.budget_max,
        gender_preference: req.query.gender_preference,
        move_in_date: req.query.move_in_date,
        room_type: req.query.room_type,
        lease_duration_preference: req.query.lease_duration_preference,
        occupation: req.query.occupation,
        smoking_preference: req.query.smoking_preference,
        religion: req.query.religion,
        pet_preference: req.query.pet_preference,
        max_roommates: req.query.max_roommates,
        q: req.query.q,
        user_id: user?.id,
        owner: req.query.owner === 'true'
      };

      RoommateModel.list(filters, (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Failed to retrieve roommate requests", error: err });
        }

        // Parse photos for each result
        const parsedResults = results.map(roommate => {
          let parsedPhotos = null;
          if (roommate.photos) {
            try {
              parsedPhotos = typeof roommate.photos === 'string' ? JSON.parse(roommate.photos) : roommate.photos;
            } catch (parseError) {
              console.warn('Failed to parse photos for roommate:', roommate.id, parseError);
              parsedPhotos = null;
            }
          }
          return { ...roommate, photos: parsedPhotos };
        });

        return res.status(200).json({ listings: parsedResults });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  get: (req, res) => {
    const id = req.params.id;

    // Try to authenticate user even on this public route
    const authMiddleware = require('../middlewares/authMiddleware');
    // This is a bit of a hack, but we need to check for user auth on a public route
    let user = null;
    try {
      // Check for token in various places
      let token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

      if (!token && req.query.token) token = req.query.token;
      if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

      if (token) {
        try {
          const jwtHelper = require('../utils/jwtHelper');
          const decoded = jwtHelper.verify(token);
          user = decoded;
        } catch (tokenError) {
          // Invalid token, user remains null
          console.log('Invalid token in roommate get:', tokenError.message);
        }
      }
    } catch (e) {
      // Token invalid, user remains null
    }

    RoommateModel.findById(id, (err, results) => {
      if (err) {
        console.error('Database error in roommate get:', err);
        return res.status(500).json({ message: 'DB error', error: err.message });
      }
      if (!results || results.length === 0) {
        console.log('Roommate not found for id:', id);
        return res.status(404).json({ message: 'Not found' });
      }

      const roommate = results[0];
      const is_owner = user && user.id === roommate.owner_id;

      return res.json({
        roommate: {
          ...roommate,
          is_owner
        }
      });
    });
  },

  update: async (req, res) => {
    const id = req.params.id;
    console.log('Update request for roommate ID:', id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files present:', req.files ? req.files.length : 0);

    RoommateModel.findById(id, async (err, results) => {
      if (err) {
        console.error('Database error finding roommate:', err);
        return res.status(500).json({ message: 'DB error' });
      }
      if (!results || results.length === 0) {
        console.log('Roommate not found for ID:', id);
        return res.status(404).json({ message: 'Not found' });
      }
      const r = results[0];
      if (!req.user || req.user.id !== r.owner_id) {
        console.log('Forbidden: user', req.user?.id, 'trying to update roommate owned by', r.owner_id);
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Validate input data
      const {
        preferred_location, budget_min, budget_max, lifestyle, move_in_date, description,
        gender_preference, room_type, lease_duration_preference, occupation,
        smoking_preference, religion, pet_preference, max_roommates
      } = req.body;

      if (!preferred_location) return res.status(400).json({ message: 'preferred_location required' });
      if (budget_min !== undefined && (isNaN(Number(budget_min)) || Number(budget_min) < 0)) return res.status(400).json({ message: 'budget_min must be a non-negative number' });
      if (budget_max !== undefined && (isNaN(Number(budget_max)) || Number(budget_max) < 0)) return res.status(400).json({ message: 'budget_max must be a non-negative number' });
      if (budget_min !== undefined && budget_max !== undefined && Number(budget_min) > Number(budget_max)) return res.status(400).json({ message: 'budget_min cannot exceed budget_max' });
      if (move_in_date !== undefined && move_in_date !== '' && Number.isNaN(Date.parse(move_in_date))) return res.status(400).json({ message: 'move_in_date must be a valid date' });

      console.log('Update data will be prepared from req.body');

      // Handle photos: frontend sends the complete final photos array
      let finalPhotos = [];
      if (req.body.photos) {
        try {
          finalPhotos = JSON.parse(req.body.photos);
          console.log('Final photos from frontend:', finalPhotos.length);
        } catch (parseError) {
          console.warn('Failed to parse photos from request:', parseError);
          finalPhotos = [];
        }
      }

      // Get existing photos for cleanup
      let existingPhotos = [];
      if (r.photos) {
        try {
          existingPhotos = typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos;
        } catch (parseError) {
          console.warn('Failed to parse existing photos:', parseError);
          existingPhotos = [];
        }
      }

      // Handle photo uploads if files are present (append to final photos)
      if (req.files && req.files.length > 0) {
        try {
          console.log('Uploading new photos:', req.files.length);
          const uploadedPhotos = await handleMultipleUploads(req.files, 'roommates');
          finalPhotos = [...finalPhotos, ...uploadedPhotos];
          console.log('Total photos after upload:', finalPhotos.length);
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          return res.status(500).json({ message: "Failed to upload photos", error: uploadError.message });
        }
      }

      // Clean up photos that are no longer in the final list
      const finalPhotoUrls = finalPhotos.map(p => p.url);
      const photosToDelete = existingPhotos.filter(existing => !finalPhotoUrls.includes(existing.url));

      if (photosToDelete.length > 0) {
        console.log('Deleting removed photos:', photosToDelete.length);
        for (const photo of photosToDelete) {
          // Delete from both Cloudinary (if configured) and local storage
          if (photo.public_id) {
            await deleteFromCloudinary(photo.public_id);
          }
          // Also try to delete local file
          if (photo.url && photo.url.startsWith('/uploads/')) {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, '..', photo.url);
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Deleted local file:', filePath);
              }
            } catch (fileError) {
              console.warn('Failed to delete local file:', filePath, fileError.message);
            }
          }
        }
      }

      let photos = finalPhotos;

      const updateData = { ...req.body };
      if (photos !== undefined) {
        updateData.photos = JSON.stringify(photos);
      }

      // Validate and sanitize updateData fields
      if (updateData.budget_min !== undefined) {
        const min = Number(updateData.budget_min);
        if (isNaN(min) || min < 0) return res.status(400).json({ message: 'budget_min must be a non-negative number' });
        updateData.budget_min = min;
      }
      if (updateData.budget_max !== undefined) {
        const max = Number(updateData.budget_max);
        if (isNaN(max) || max < 0) return res.status(400).json({ message: 'budget_max must be a non-negative number' });
        updateData.budget_max = max;
      }
      if (updateData.max_roommates !== undefined) {
        const max = parseInt(updateData.max_roommates, 10);
        if (isNaN(max) || max < 1) return res.status(400).json({ message: 'max_roommates must be an integer >= 1' });
        updateData.max_roommates = max;
      }
      if (updateData.lease_duration_preference !== undefined) {
        const duration = parseInt(updateData.lease_duration_preference, 10);
        if (isNaN(duration) || duration < 1) return res.status(400).json({ message: 'lease_duration_preference must be an integer >= 1' });
        updateData.lease_duration_preference = duration;
      }
      if (updateData.move_in_date !== undefined && updateData.move_in_date !== '' && Number.isNaN(Date.parse(updateData.move_in_date))) {
        return res.status(400).json({ message: 'move_in_date must be a valid date' });
      }

      // Remove any fields that shouldn't be in the update
      delete updateData.photos_to_delete; // This is handled separately

      console.log('Final update data keys:', Object.keys(updateData));

      RoommateModel.update(id, updateData, async (err2, result) => {
        if (err2) {
          console.error('Database update error:', err2);
          // Clean up newly uploaded photos if database update fails
          if (req.files && req.files.length > 0) {
            // Clean up newly uploaded files from both storage types
            const newlyUploaded = finalPhotos.slice(-req.files.length); // Get only the newly uploaded ones
            for (const photo of newlyUploaded) {
              if (photo.public_id) {
                await deleteFromCloudinary(photo.public_id);
              }
              // Also delete local file
              if (photo.url && photo.url.startsWith('/uploads/')) {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '..', photo.url);
                try {
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Cleaned up local file after failed update:', filePath);
                  }
                } catch (fileError) {
                  console.warn('Failed to clean up local file after failed update:', filePath, fileError.message);
                }
              }
            }
          }
          return res.status(500).json({ message: 'DB error', error: err2.message });
        }
        console.log('Database update successful');
        return res.json({ message: 'Updated', result });
      });
    });
  },

  remove: async (req, res) => {
    const id = req.params.id;
    RoommateModel.findById(id, async (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
      const r = results[0];
      if (!req.user || req.user.id !== r.owner_id) return res.status(403).json({ message: 'Forbidden' });

      // Clean up photos from both Cloudinary and local storage before deleting the record
      if (r.photos) {
        try {
          let photos = typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos;
          if (Array.isArray(photos)) {
            for (const photo of photos) {
              // Delete from Cloudinary (if configured)
              if (photo.public_id) {
                await deleteFromCloudinary(photo.public_id);
              }
              // Delete local file
              if (photo.url && photo.url.startsWith('/uploads/')) {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '..', photo.url);
                try {
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Deleted local file during roommate removal:', filePath);
                  }
                } catch (fileError) {
                  console.warn('Failed to delete local file during removal:', filePath, fileError.message);
                }
              }
            }
          }
        } catch (photoError) {
          console.warn('Failed to clean up photos during deletion:', photoError);
          // Continue with deletion even if photo cleanup fails
        }
      }

      RoommateModel.delete(id, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'DB error' });
        return res.json({ message: 'Deleted', result });
      });
    });
  },

  contactOwner: (req, res) => {
    const id = req.params.id;
    const senderId = req.user.id;
    const UserModel = require('../models/userModel');
    RoommateModel.findById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
      const r = results[0];
      if (!r.owner_id) return res.status(404).json({ message: 'Owner contact not available' });

      // Prevent self-contacting
      if (r.owner_id === senderId) {
        return res.status(400).json({ message: 'You cannot contact yourself' });
      }

      UserModel.findById(r.owner_id, (err2, ures) => {
        if (err2) return res.status(500).json({ message: 'DB error' });
        if (!ures || ures.length === 0) return res.status(404).json({ message: 'Owner not found' });
        const owner = ures[0];
        return res.json({ owner: { username: owner.username, email: owner.email, phone: owner.phone } });
      });
    });
  },

  // Express interest in a roommate request
  expressInterest: (req, res) => {
    const roommateId = req.params.id;
    const senderId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get roommate details to find owner
    RoommateModel.findById(roommateId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Roommate request not found' });

      const roommate = results[0];
      if (roommate.owner_id === senderId) {
        return res.status(400).json({ message: 'You cannot express interest in your own roommate request' });
      }

      const MessageModel = require('../models/messageModel');

      // Send message to roommate request owner
      MessageModel.send({
        sender_id: senderId,
        receiver_id: roommate.owner_id,
        subject: `Interest in your roommate request`,
        message,
        related_type: 'roommate',
        related_id: roommateId
      }, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Failed to send message' });

        return res.json({ message: 'Interest expressed successfully!' });
      });
    });
  }
};

module.exports = RoommateController;
