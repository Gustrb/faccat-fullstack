const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/SupplierController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireAdmin);

router.get('/', supplierController.index);
router.get('/:id', supplierController.show);
router.post('/', supplierController.create);
router.put('/:id', supplierController.update);
router.delete('/:id', supplierController.delete);

module.exports = router;

