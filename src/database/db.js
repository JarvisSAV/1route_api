import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Paquete } from '../models/index.js'
dotenv.config()

mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
  .then(db => console.log('DB Connected: ', db.connection.db.databaseName))
  .catch(err => console.log("Error al conectarse: ", err.message))


async function modificar_paquetes() {
  try {
    const paquetes = await Paquete.find({});
    
    paquetes.forEach(async (paquete, index) => {
      let nombre = nombres[index]
      let telefono = Math.floor(Math.random() * 900000000 + 100000000);

      paquete = await Paquete.updateOne({ _id: paquete._id }, { nombre: 'ENTREGADO', telefono: telefono })

      // paquete.nombre = nombre
      // paquete.telefono = telefono

      // const paqueteDB = await paquete.save();
      console.log('Paquete modificado', paquete);
      // console.log(paquete.telefono)
    });
  } catch (error) {
    console.log(error);
  }
}

// modificar_paquetes()