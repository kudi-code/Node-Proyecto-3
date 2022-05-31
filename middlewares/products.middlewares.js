const { catchAsync } = require('../utils/catchAsync');
const {Product} = require('../models/product.model')

const protectProductOwner = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const {id} = req.params

  const product = await Product.findOne({where: {id, status: 'active'}})

  // Compare the id's
  if (sessionUser.id !== product.userId) {
    // If the ids aren't equal, return error
    return next(new AppError('You don´t have access for do that', 403));
  }

  //sending the product searched
  req.product = product;


  // If the ids are equal, the request pass
  next();
});

module.exports = { protectProductOwner };
