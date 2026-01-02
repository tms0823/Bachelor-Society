const HousingModel = require("../models/housingModel");
const { handleMultipleUploads, deleteFromCloudinary } = require("../utils/fileUpload");

const HousingController = {
  // Create housing listing
  createHousing: async (req, res) => {
    try {
      let {
        address, area, rent, available_from, rooms,
        property_type, gender_preference, lease_duration_months,
        allowed_residents, smoking_allowed, pets_allowed,
        religion_preference, university_preference, max_occupants,
        is_private
      } = req.body;

      if (!address || !area || rent == null || !available_from || rooms == null) {
        return res.status(400).json({ message: "Required fields: address, area, rent, available_from, rooms" });
      }

      rent = Number(rent);
      rooms = parseInt(rooms, 10);
      if (isNaN(rent) || rent <= 0) return res.status(400).json({ message: "rent must be a positive number" });
      if (isNaN(rooms) || rooms < 1) return res.status(400).json({ message: "rooms must be an integer >= 1" });
      if (Number.isNaN(Date.parse(available_from))) return res.status(400).json({ message: "available_from must be a valid date" });

      const user_id = req.user.id;
      let photos = null;

        // Handle photo uploads if files are present
        if (req.files && req.files.length > 0) {
          try {
            const uploadedPhotos = await handleMultipleUploads(req.files, 'housing');
            photos = uploadedPhotos;
          } catch (uploadError) {
            return res.status(500).json({ message: "Failed to upload photos", error: uploadError.message });
          }
        }

      const housingData = {
        address, area, rent, available_from, rooms, user_id,
        property_type: property_type || 'apartment',
        gender_preference: gender_preference || 'any',
        lease_duration_months: lease_duration_months || 12,
        allowed_residents: allowed_residents || 'anyone',
        smoking_allowed: smoking_allowed !== undefined ? smoking_allowed : true,
        pets_allowed: pets_allowed !== undefined ? pets_allowed : true,
        religion_preference,
        university_preference,
        max_occupants,
        photos,
        is_private: is_private || false
      };

      HousingModel.createHousing(housingData, (err, result) => {
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
          return res.status(500).json({ message: "Failed to create housing listing", error: err });
        }

        return res.status(201).json({
          message: "Housing listing created successfully",
          housing_id: result.insertId,
          photos: photos
        });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Get all housing listings
  getAllHousing: async (req, res) => {
    try {
      const filters = {
        min_rent: req.query.min_rent,
        max_rent: req.query.max_rent,
        rooms: req.query.rooms,
        area: req.query.location, // Map location parameter to area
        q: req.query.q,
        property_type: req.query.property_type,
        gender_preference: req.query.gender_preference,
        smoking_allowed: req.query.smoking_allowed,
        pets_allowed: req.query.pets_allowed,
        available_from: req.query.available_from,
        user_id: req.user?.id,
        owner: req.query.owner === 'true'
      };

      HousingModel.getAllHousing(filters, (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Failed to retrieve housing listings", error: err });
        }
        return res.status(200).json({ listings: results });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Get a single housing listing by ID
  getHousingById: async (req, res) => {
    try {
      const { id } = req.params;

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

      HousingModel.getHousingById(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (!results || results.length === 0) return res.status(404).json({ message: 'Housing listing not found' });

        const listing = results[0];
        const is_owner = user && user.id === listing.user_id;

        return res.status(200).json({
          listing: {
            ...listing,
            is_owner
          }
        });
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Update a housing listing
  updateHousing: async (req, res) => {
    try {
      const id = req.params.id;
      // Find the listing first
      HousingModel.getHousingById(id, async (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
        const listing = results[0];
        // Ensure authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        if (listing.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

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

        // Handle photos to delete
        if (req.body.photosToDelete) {
          try {
            const photosToDelete = JSON.parse(req.body.photosToDelete);
            // Remove photos from existingPhotos array
            existingPhotos = existingPhotos.filter((photo, index) => !photosToDelete.includes(index));

            // Delete actual files from filesystem
            const fs = require('fs');
            const path = require('path');
            photosToDelete.forEach(index => {
              if (listing.photos && listing.photos[index]) {
                const photoObj = typeof listing.photos === 'string' ? JSON.parse(listing.photos)[index] : listing.photos[index];
                if (photoObj && photoObj.url) {
                  // Extract filename from URL (format: /uploads/filename.ext)
                  const filename = photoObj.url.split('/').pop();
                  const filePath = path.join('uploads', filename);
                  try {
                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath);
                    }
                  } catch (fileErr) {
                    console.error('Error deleting photo file:', fileErr);
                    // Don't fail the entire update if file deletion fails
                  }
                }
              }
            });
          } catch (parseErr) {
            console.error('Error parsing photosToDelete:', parseErr);
            // Continue with update even if parsing fails
          }
        }

        // Handle photo uploads if files are present
        if (req.files && req.files.length > 0) {
          try {
            const uploadedPhotos = await handleMultipleUploads(req.files, 'housing');
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

        if (updateData.rent !== undefined) {
          const r = Number(updateData.rent);
          if (isNaN(r) || r <= 0) return res.status(400).json({ message: 'rent must be a positive number' });
          updateData.rent = r;
        }
        if (updateData.rooms !== undefined) {
          const rm = parseInt(updateData.rooms, 10);
          if (isNaN(rm) || rm < 1) return res.status(400).json({ message: 'rooms must be an integer >= 1' });
          updateData.rooms = rm;
        }
        if (updateData.available_from !== undefined && Number.isNaN(Date.parse(updateData.available_from))) {
          return res.status(400).json({ message: 'available_from must be a valid date' });
        }

        HousingModel.updateHousing(id, updateData, (err2, result) => {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
          return res.json({ message: 'Updated', result, photos });
        });
      });
    } catch (e) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete a housing listing
  deleteHousing: async (req, res) => {
    try {
      const id = req.params.id;
      HousingModel.getHousingById(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (!results || results.length === 0) return res.status(404).json({ message: 'Not found' });
        const listing = results[0];
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        if (listing.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

        HousingModel.deleteHousing(id, (err2, result) => {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
          return res.json({ message: 'Deleted', result });
        });
      });
    } catch (e) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Inquire about a housing listing
  inquire: (req, res) => {
    const housingId = req.params.id;
    const senderId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get housing details to find owner
    HousingModel.getHousingById(housingId, (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (!results || results.length === 0) return res.status(404).json({ message: 'Housing listing not found' });

      const housing = results[0];
      if (housing.user_id === senderId) {
        return res.status(400).json({ message: 'You cannot inquire about your own housing listing' });
      }

      const MessageModel = require('../models/messageModel');

      // Send message to housing listing owner
      MessageModel.send({
        sender_id: senderId,
        receiver_id: housing.user_id,
        subject: `Inquiry about housing at ${housing.address}`,
        message,
        related_type: 'housing',
        related_id: housingId
      }, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Failed to send inquiry' });

        return res.json({ message: 'Inquiry sent successfully!' });
      });
    });
  }
};

module.exports = HousingController;
