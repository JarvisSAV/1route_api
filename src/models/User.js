import mongoose from "mongoose"

const schema = mongoose.Schema({

  dni: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: Number,
    required: true,
    trim: true
  },
  estado: {
    type: Boolean,
    default: true,
  },
  tipo: {
    type: String,
    required: true,
    trim: true
  },
  ubicacion: {
    type: Object,
    required: true,
    trim: true
  }
}, { timestamps: true })

let User

try {
  User = mongoose.model('User')
} catch (error) {
  User = mongoose.model('User', schema)
}

export { User }