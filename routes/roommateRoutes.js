const express = require('express');
const router = express.Router();
const RoommateController = require('../controllers/roommateController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require("../utils/fileUpload");

router.get('/', RoommateController.list);
router.post('/', authMiddleware, upload.array('photos', 10), RoommateController.create);
router.get('/:id', RoommateController.get);
router.put('/:id', authMiddleware, upload.array('photos', 10), RoommateController.update);
router.delete('/:id', authMiddleware, RoommateController.remove);

// contact owner
router.post('/:id/contact', authMiddleware, RoommateController.contactOwner);
// express interest
router.post('/:id/interest', authMiddleware, RoommateController.expressInterest);

module.exports = router;
