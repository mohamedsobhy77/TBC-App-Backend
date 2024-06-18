const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlwares/uploadImageMiddleware");

const Brand = require("../models/brandModel");

//uploadSingleImage
exports.uploadBrandImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

//@desc  Get list of brands
//@route GET /api/v1/brands
//@access public
exports.getBrands = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit; //(2-1)*5=5
  const brands = await Brand.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: brands.length, page, data: brands });
});

//@desc  Get specific brand by id
//@route GET /api/v1/brands/:id
//@access public
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    //res.status(404).json({msg:`No brand for this id ${id}`});
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

//@desc  Create brand
//@route  POST /api/v1/brands
//@access private
exports.createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await Brand.create({ name, slug: slugify(name) });
  res.status(201).json({ data: brand });
});

//@desc  Update brand
//@route  PUT /api/v1/brands/:id
//@access private
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify },
    { new: true }
  );

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

//@desc  Delete brand
//@route  DELETE /api/v1/brands/:id
//@access private
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndDelete(id);

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(204).send();
});
