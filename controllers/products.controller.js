const { Product } = require('../models/product.model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { } = require('../models/category.model')

const createProduct = catchAsync(async (req, res, next) => {
  const {title, description,quantity, price, categoryId} = req.body

  const {sessionUser} = req

  if(sessionUser===undefined){
    return next(new AppError('You must init session', 400));
  }
  const product = await Product.create({title, description, quantity,price,categoryId,userId: sessionUser.id})

  res.status(200).json({
    status: 'done!',
    product
  })

});

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({where: {status: 'active'}})

  res.status(200).json({
    products
  })
});

const getProductById = catchAsync(async (req, res, next) => {
  const {id} = req.params

  const product = await Product.findOne({where: {id,status: 'active'}})

  res.status(200).json({
    product
  })
});
const updateProduct = catchAsync(async (req, res, next) => {
  const {title, description,quantity, price, categoryId} = req.body
  //Product obtained from ProtectProductOwner
  const {product} = req

  product.update({title,description,quantity,price,categoryId})

  res.status(200).json({
    status: 'done!',
    product
  })

});

const deleteProduct = catchAsync(async (req, res, next) => {
  const {product} = req

  product.update({status:'deleted'})

  res.status(200).json({
    status: 'deleted!'
  })
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
