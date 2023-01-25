const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(
    'shutting down <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  );
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;

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

const server = app.listen(port, () => {
  console.log(`App running on the port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(
    'shutting down <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  );
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
