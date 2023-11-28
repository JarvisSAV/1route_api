import mongoose from "mongoose"

const schema = mongoose.Schema({

  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  origen: {
    type: String,
    required: true,
    trim: true
  },
  destino: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    required: true,
    trim: true
  },
  coordenadas: {
    latitud: {
      type: Number,
      required: true,
      trim: true
    },
    longitud: {
      type: Number,
      required: true,
      trim: true
    }
  },
  estado: {
    type: String,
    required: true,
    trim: true
  },
}, { timestamps: true })

let Paquete

try {
  Paquete = mongoose.model('Paquete')
} catch (error) {
  Paquete = mongoose.model('Paquete', schema)
}

export { Paquete }