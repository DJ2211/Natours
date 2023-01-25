const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connected sucessfully!!!'));

//   read json data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data in db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data sucessfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all the data in db

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted sucessfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
