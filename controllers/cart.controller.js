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
  console.log((cartActive))
  if (!cartActive) {
    cartActive = await Cart.create({ userId: sessionUser.id });
    message.push('Creating new Cart');    
  }

  const product = await ProductInCart.findOne({
    where:{ productId,
    cartId: cartActive.id,}
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
  //Searching cart active
  const cartActive = await Cart.findOne({ where: { status: 'active', userId: sessionUser.id } });
  //if cart active don´t exist
  if (!cartActive) {
    return next(new AppError('You need to create a Cart', 400));
  }
  //Product To Update
  const pToUpdate = await ProductInCart.findOne({
    where: { status: 'active', cartId: cartActive.id, productId },
  });
  //Search failed
  if(!pToUpdate){
    return next(new AppError('product not found, try to search another id', 400));
  }
  //Remove product by Quantity=0
  if(newQty===0){
     pToUpdate.update({status:'removed', quantity: newQty });      
  }
  else{
    pToUpdate.update({ quantity: newQty });
  }

  res.status(200).json({
    status: 'done!',
    pToUpdate,
  });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { sessionUser } = req;
  // console.log(id);
  //Searching cart active
  const cartActive = await Cart.findOne({ where: { status: 'active', userId: sessionUser.id } });
  const pToDelete = await ProductInCart.findOne({
    where: { status: 'active', cartId: cartActive.id, productId },
  });
  //Searching error
  if(!pToDelete){
    return next(new AppError('product not found, try to search another id', 400));
  }
  pToDelete.update({status:'removed'});      
  res.status(200).json({
    status: 'done!',
    pToDelete,
  });

});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cartActive = await Cart.findOne({ where: { status: 'active', userId: sessionUser.id } });

  const products = await ProductInCart.findAll({where: {status:'active', cartId: cartActive.id}})

  const PromisePrice = products.map(async product => {
      //Searching productsInCart in Products
      const productInStore = await Product.findOne({where:{status: 'active', id: product.productId}})

      //Updating Quantity
      productInStore.update({quantity: productInStore.quantity- product.quantity})

      //Updating Status of ProductInCart
      product.update({status:'purchased'})
      
      //Returning the value of subtotals
      //Quantity --- Price --- Subtotal
      //   3           50        150
      return(productInStore.price*product.quantity)
  })
  //Solving promises
  const priceResolved = await Promise.all(PromisePrice);
  console.log(priceResolved)
    //Calculate the total
   const total = priceResolved.reduce((x,y) => x+y,0)
   console.log(total)
   //Cart Purchased
   cartActive.update({status: 'purchased'})
   //Create Order
   const newOrder = await Order.create({userId: sessionUser.id, cartId: cartActive.id, totalPrice: total})

   res.status(200).json({
       status: 'done!',
       newOrder
   })
});



module.exports = ({
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
});
