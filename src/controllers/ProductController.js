const productService = require('../services/ProductService');

const isEmptyValue = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  value === 'null' ||
  value === 'undefined';

const parseOptionalNumber = (value, type = 'float') => {
  if (value === undefined) {
    return undefined;
  }

  if (isEmptyValue(value)) {
    return null;
  }

  const parsed =
    type === 'int' ? parseInt(value, 10) : parseFloat(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Valor inválido para campo numérico (${value})`);
  }

  return parsed;
};

const buildProductPayload = (payload) => {
  const productData = { ...payload };

  const price = parseOptionalNumber(productData.price, 'float');
  if (price !== undefined) {
    productData.price = price;
  }

  const originalPrice = parseOptionalNumber(
    productData.original_price,
    'float'
  );
  if (originalPrice !== undefined) {
    productData.original_price = originalPrice;
  }

  const stock = parseOptionalNumber(productData.stock, 'int');
  if (stock !== undefined) {
    productData.stock = stock;
  }

  const supplierId = parseOptionalNumber(productData.supplier_id, 'int');
  if (supplierId !== undefined) {
    productData.supplier_id = supplierId;
  }

  return productData;
};

class ProductController {
  async createProduct(req, res) {
    try {
      const productData = buildProductPayload({
        ...req.body,
        image_url: req.file ? `/uploads/${req.file.filename}` : undefined
      });
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
      const productData = buildProductPayload({
        ...req.body,
        image_url: req.file ? `/uploads/${req.file.filename}` : undefined
      });
      
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
