const express = require('express');

// Controllers
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
} = require('../controllers/products.controller');

// Middlewares
const { protectToken } = require('../middlewares/users.middlewares');
const {
  createProductValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');
const { protectProductOwner } = require('../middlewares/products.middlewares');

const router = express.Router();

router.get('/', getAllProducts);

router.get("/categories", getAllCategories)


router.get('/:id', getProductById);




router.use(protectToken);

router.post('/categories' , createCategory)
router.patch('/categories/:id' , updateCategory)

router.post('/', createProductValidations, checkValidations, createProduct);

router
  .route('/:id')
  .patch(protectProductOwner, updateProduct)
  .delete(protectProductOwner, deleteProduct);

module.exports = { productsRouter: router };
