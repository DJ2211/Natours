const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      unique: true,
      required: [true, 'A tour must have a name'],
      trim: true,
      type: String,
      maxlength: [
        40,
        'A tour name should have less than or equal to 40 characters',
      ],
      minlength: [
        10,
        'A tour name should have greater than or equal to 10 characters',
      ],
      // validate: [validator.isAlpha, 'A tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour should have greater than or equal to 1 rating'],
      max: [5, 'A tour should have less than or equal to 5 rating'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy , medium or difficult',
      },
    },
    price: {
      required: [true, 'A tour must have a price'],
      type: Number,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than original price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('will save documents');
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start} milliseconds!!`);
  next();
});

//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
