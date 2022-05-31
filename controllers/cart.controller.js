const { AppError } = require('../../Proyecto 2/utils/appError');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');


const { catchAsync } = require('../utils/catchAsync');

const addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;
  //Array of messages
  var message = [];

  var cartActive = await Cart.findOne({ where: { status: 'active', userId: sessionUser.id } });

  if (!cartActive) {
    cartActive = await Cart.create({ userId: sessionUser.id });
    message.push('Creating new Cart');
  }

  const product = await ProductInCart.findOne({
    where: productId,
    cartId: cartActive.id,
  });
  //If the product exist in this cart
  if (product) {
    if (product.status === 'active') {
      return next(
        new AppError('This product has been added. Try to Update Cart', 400)
      );
    }
    if (product.status === 'removed') {
      product.update({ quantity, status: 'active' });
      message.push('Re-adding product to cart');
    }
  }
  //else
  else {
    await ProductInCart.create({ cartId: cartActive.id, productId, quantity });
    message.push('Product Added to Cart');
  }

  res.status(200).json({
    cartActive,
    message,
  });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { productId, newQty } = req.body;
  const { sessionUser } = req;


  const cartActive = await Cart.findOne({ where: { status: 'active', userId: sessionUser.id } });

  if (!cartActive) {
    return next(new AppError('You need to create a Cart', 400));
  }

  const pToUpdate = await ProductInCart.findOne({
    where: { status: 'active', cartId: cartActive.id, productId },
  });
  if(newQty===0){
     pToUpdate.update({status:'removed', quantity: newQty });      
  }
  else{
    pToUpdate.update({ quantity: newQty });
  }

  // const orders = await Order.findAll({
  //     where: { status: 'active', userId: sessionUser.id },
  //     include: [{model: Meal, include: [{model: Restaurant}]}] ,
  //  });
  res.status(200).json({
    status: 'done!',
    pToUpdate,
  });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cartActive = await Cart.findOne({ where: { status: 'active', userId: sessionUser.id } });

  const products = await ProductInCart.findAll({where: {status:'active', cartId: cartActive.id}})

  const price = products.map(product => {
      //Searching productsInCart in Products
      const productInStore = await Product.findOne({where:{status: 'active', id: product.productId}})

      //Updating Quantity
      productInStore.update({quantity: productInStore.quantity- product.quantity})

      //Updating Status of ProductInCart
      product.update({status:'purchased'})
      
      return(productInStore.price*product.quantity)
  })
   const total = price.reduce(x,y => x+y,0)

   cartActive.update({status: 'purchased'})

   const newOrder = await Order.create({userId: sessionUser.id, cartId: cartActive.id, totalPrice: total})

   res.status(200).josn({
       status: 'done!',
       newOrder
   })
});

const removeProductFromCart = catchAsync(async (req, res, next) => {});

module.exports({
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
});
