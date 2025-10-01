const productService = require('../services/ProductService');

class ProductController {
  async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        image_url: req.file ? `/uploads/${req.file.filename}` : undefined
      };
      const productId = await productService.createProduct(productData);
      res.status(201).json({ id: productId, message: 'Produto criado com sucesso' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        image_url: req.file ? `/uploads/${req.file.filename}` : undefined
      };
      
      const result = await productService.updateProduct(req.params.id, productData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const result = await productService.deleteProduct(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateStock(req, res) {
    try {
      const { stock } = req.body;
      const result = await productService.updateStock(req.params.id, stock);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
