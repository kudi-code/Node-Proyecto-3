const { Product } = require('../models/product.model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { Category } = require('../models/category.model');

const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, quantity, price, categoryId } = req.body;

  const { sessionUser } = req;

  if (sessionUser === undefined) {
    return next(new AppError('You must log in', 400));
  }
  const product = await Product.create({
    title,
    description,
    quantity,
    price,
    categoryId,
    userId: sessionUser.id,
  });

  res.status(200).json({
    status: 'done!',
    product,
  });
});

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({ where: { status: 'active' } });

  res.status(200).json({
    products,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ where: { id, status: 'active' } });

  res.status(200).json({
    product,
  });
});
const updateProduct = catchAsync(async (req, res, next) => {
  const { title, description, quantity, price, categoryId } = req.body;
  //Product obtained from ProtectProductOwner
  const { product } = req;

  product.update({ title, description, quantity, price, categoryId });

  res.status(200).json({
    status: 'done!',
    product,
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  //Product obtained from ProtectProductOwner
  const { product } = req;

  product.update({ status: 'deleted' });

  res.status(200).json({
    status: 'deleted!',
  });
});

const getAllCategories = catchAsync(async (req, res, next) => {
  console.log("Categories get")
  const categories = await Category.findAll({ where: { status: 'active' } });
  res.status(200).json({
    categories,
  });
});
const createCategory = catchAsync(async (req, res, next) => {
  const {name} = req.body
  await Category.create({name})

  const categories = await Category.findAll({ where: { status: 'active' } });

  res.status(200).json({
    status: 'created!',
    categories,
  });
});
const updateCategory = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({ where: { status: 'active' } });
  res.status(200).json({
    categories,
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
};
