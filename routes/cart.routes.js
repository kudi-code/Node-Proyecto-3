const express = require('express');

// Controllers
const {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
} = require('../controllers/cart.controller');
const { validateQtyOk } = require('../middlewares/cart.middlewares');

// Middlewares
const { protectToken } = require('../middlewares/users.middlewares');

const router = express.Router();

router.use(protectToken);

router.delete('/:productId', removeProductFromCart)

router.post('/add-product', validateQtyOk,addProductToCart);

router.patch('/update-cart', validateQtyOk,updateProductInCart);

router.post('/purchase', purchaseCart);

module.exports = { cartRouter: router };
