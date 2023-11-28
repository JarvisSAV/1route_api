import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
  .then(db => console.log('DB Connected: ', db.connection.db.databaseName))
  .catch(err => console.log("Error al conectarse: ", err.message))
