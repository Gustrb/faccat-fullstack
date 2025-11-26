const supplierService = require('../services/SupplierService');

class SupplierController {
  async index(req, res) {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async show(req, res) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id);
      res.json(supplier);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const supplierId = await supplierService.createSupplier(req.body);
      res.status(201).json({ id: supplierId, message: 'Fornecedor criado com sucesso' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await supplierService.updateSupplier(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await supplierService.deleteSupplier(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new SupplierController();

