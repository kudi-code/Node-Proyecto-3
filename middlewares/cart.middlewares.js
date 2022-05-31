const { catchAsync } = require('../utils/catchAsync');
const {Cart} = require('../models/cart.model');
const { Product} = require('../models/product.model');

const validateQtyOk = catchAsync(async(req,res,next) => {
    const {quantity, newQty, productId} = req.body
    var Quant
    if(!quantity){  
        //if in the req.body don´t appear quantity
        Quant = newQty
    }
    else{
        Quant = quantity
    }

    const product = await Product.findOne({where:{status: 'active' , id: productId}})

    if(!product) {
        return next(new AppError('This product doesn´t exist', 400));
    }

    if(product.quantity<Quant){
        return next(new AppError(`You cannot add this amount of this product. The max amount is: ${product.quantity}`, 400));
        }
    next()

}) 


module.exports = { validateQtyOk };