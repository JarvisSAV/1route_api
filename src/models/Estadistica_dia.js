import mongoose from "mongoose"

const schema = mongoose.Schema({

  fecha: {
    type: Date,
    required: true,
    trim: true
  },
  total_paquetes: {
    type: Number,
    required: true,
    trim: true
  },
  paquetes_entregados: {
    type: Number,
    required: true,
    trim: true
  },
  paquetes_pendientes: {
    type: Number,
    required: true,
    trim: true
  },
  paquetes_rechazados: {
    type: Number,
    required: true,
    trim: true
  },
}, { timestamps: true })

let Estadistica_dia

try {
  Estadistica_dia = mongoose.model('Estadistica_dia')
} catch (error) {
  Estadistica_dia = mongoose.model('Estadistica_dia', schema)
}

export { Estadistica_dia }