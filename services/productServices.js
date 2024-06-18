// const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { uploadMixOfImages } = require("../middlwares/uploadImageMiddleware");

const Product = require("../models/productModel");

exports.uploadProductImage = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);

  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

//@desc  Get list of products
//@route GET /api/v1/products
//@access public

exports.getProducts = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit; //(2-1)*5=5
  const products = await Product.find({})
    .skip(skip)
    .limit(limit)
    .populate({ path: "category", select: "name -_id" });
  res.status(200).json({ results: products.length, page, data: products });
});

//@desc  Get specific product by id
//@route GET /api/v1/products/:id
//@access public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate({
    path: "category",
    select: "name -_id",
  });
  if (!product) {
    //res.status(404).json({msg:`No product for this id ${id}`});
    return next(new ApiError(`No product for this id ${id}`, 404));
  }
  res.status(200).json({ data: product });
});

//@desc  Create product
//@route  POST /api/v1/products
//@access private
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});

//@desc  Update product
//@route  PUT /api/v1/products/:id
//@access private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  if (!product) {
    return next(new ApiError(`No product for this id ${id}`, 404));
  }
  res.status(200).json({ data: product });
});

//@desc  Delete product
//@route  DELETE /api/v1/products/:id
//@access private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(204).send();
});
