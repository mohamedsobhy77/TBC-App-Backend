//const slugify = require('slugify');
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subCategory required")
    .isLength({ min: 3 })
    .withMessage("Too short SubCategory name")
    .isLength({ max: 32 })
    .withMessage("Too long SubCategory name"),
  // .custom((val, { req }) => {
  // req.body.slug = slugify(val);
  // return true;
  // }),
  check("category")
    .notEmpty()
    .withMessage("subCategory must be belong to category")
    .isMongoId()
    .withMessage("Invalid Category id format"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  // body('name')
  //     .optional()
  //     .custom((val, { req }) => {
  //     req.body.slug = slugify(val);
  //     return true;
  // }),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];
