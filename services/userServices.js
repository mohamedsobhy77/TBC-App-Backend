const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlwares/uploadImageMiddleware");

const User = require("../models/userModel");

//uploadSingleImage
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

//@desc  Get list of users
//@route GET /api/v1/users
//@access private
exports.getUsers = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit; //(2-1)*5=5
  const users = await User.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: users.length, page, data: users });
});

//@desc  Get specific user by id
//@route GET /api/v1/users/:id
//@access private
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    //res.status(404).json({msg:`No user for this id ${id}`});
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  res.status(200).json({ data: user });
});

//@desc  Create user
//@route  POST /api/v1/users
//@access private
exports.createUser = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = await User.create({ name, slug: slugify(name) });
  res.status(201).json({ data: user });
});

//@desc  Update user
//@route  PUT /api/v1/users/:id
//@access private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  res.status(200).json({ data: user });
});

//@desc  Delete user
//@route  DELETE /api/v1/users/:id
//@access private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  res.status(204).send();
});
