import mongoose from "mongoose"

const schema = mongoose.Schema({

  fecha: {
    type: Date,
    required: true,
    trim: true
  },
  unidad_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unidad',
    required: true,
    trim: true
  },
  chofer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chofer',
    required: true,
    trim: true
  },
  paquetes: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paquete',
        required: true,
        trim: true
      },
      estado: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  puntos_entrega: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paquete',
        required: true,
        trim: true
      },
      direccion: {
        type: String,
        required: true,
        trim: true
      },
    }
  ]

}, { timestamps: true })

let Ruta

try {
  Ruta = mongoose.model('Ruta')
} catch (error) {
  Ruta = mongoose.model('Ruta', schema)
}

export { Ruta }