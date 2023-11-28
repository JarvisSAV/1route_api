import mongoose from "mongoose"

const schema = mongoose.Schema({

  placa: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  marca: {
    type: String,
    required: true,
    trim: true
  },
  modelo: {
    type: String,
    required: true,
    trim: true
  },
  capacidad: {
    type: Number,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    required: true,
    trim: true
  },
}, { timestamps: true })

let Unidad

try {
  Unidad = mongoose.model('Unidad')
} catch (error) {
  Unidad = mongoose.model('Unidad', schema)
}

export { Unidad }