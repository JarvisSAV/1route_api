import { PubSub } from 'graphql-subscriptions'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cookie from 'cookie'
import { Paquete, Ruta, Unidad, User } from "../models/index.js"
import { TIPO_USER } from "../utils/index.js"

const pubsub = new PubSub()

let currentNumber = 0;

const nombres = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Sophia', 'Jackson', 'Ava', 'Oliver', 'Isabella', 'Lucas',
  'Amelia', 'Henry', 'Mia', 'Ethan', 'Harper', 'Evelyn', 'Benjamin', 'Aria', 'Alexander', 'Scarlett',
  'James', 'Abigail', 'Michael', 'Luna', 'Ella', 'Grayson', 'Avery', 'Levi', 'Ellie', 'Daniel',
  'Aubrey', 'Logan', 'Grace', 'Mateo', 'Chloe', 'Jack', 'Sofia', 'Carter', 'Riley', 'Henry', 'Zoe',
  'Owen', 'Hannah', 'Wyatt', 'Victoria', 'Muhammad', 'Madison', 'Sebastian', 'Eleanor', 'Camila', 'Julian', 'Silvino'
]

export const resolvers = {
  Query: {
    currentNumber() {
      return currentNumber;
    },
    ping: () => 'PONG',
    me: (parent, args, context) => {
      return context.currentUser
    },
    paquetesXchofer: async (parent, args, context) => {
      const user = context.currentUser
      if (!user) {
        throw new Error('Authentication required')
      }
      const ruta = await Ruta.find({
        fecha: {
          $gte: new Date('2023-11-20'),
          $lt: new Date('2023-11-21')
        }, chofer_id: user._id
      })

      const paquetes = ruta[0].paquetes.map(async (paquete) => {
        const p = await Paquete.findById(paquete._id)
        return p
      })

      console.log(ruta)
      return paquetes
    },
    listChoferes: async (parent, args, context) => {
      const user = context.currentUser
      if (!user || user.tipo !== TIPO_USER.ADMIN) {
        throw new Error('Authentication required')
      }
      const choferes = await User.find({ tipo: TIPO_USER.CHOFER })
      return choferes
    },
    listUnidades: async (parent, args, context) => {
      const user = context.currentUser
      if (!user || user.tipo !== TIPO_USER.ADMIN) {
        throw new Error('Authentication required')
      }
      const unidades = await Unidad.find({ estado: 'DISPONIBLE' })
      return unidades
    },
    listRutas: async (parent, args, context) => {
      const user = context.currentUser
      if (!user || user.tipo !== TIPO_USER.ADMIN) {
        throw new Error('Authentication required')
      }
      const rutas = await Ruta.find()
      return rutas
    },
    allPaquetes: async (parent, args, context) => {
      const user = context.currentUser
      if (!user || user.tipo !== TIPO_USER.ADMIN) {
        throw new Error('Authentication required')
      }
      const paquetes = await Paquete.find()
      return paquetes
    },
  },
  Mutation: {
    incrementNumber() {
      currentNumber++;
      pubsub.publish('NUMBER_INCREMENTED', { numberIncremented: currentNumber });
      return currentNumber;
    },
    addUser: async (parent, args) => {
      const salt = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(args.password, salt)
      const user = new User({ ...args, password, tipo: args.tipo || TIPO_USER.CHOFER, estado: true })

      return user.save()
    },
    createPaquete: async (parent, args, context) => {
      // console.log('addPaquete')
      const user = context.currentUser
      if (!user) {
        throw new Error('Authentication required')
      }
      const paquete = new Paquete({ ...args, estado: 'PENDIENTE' })

      return paquete.save()
    },
    loginAdmin: async (parent, args, context) => {
      const user = await User.findOne({ dni: args.dni })

      if (!user || !bcrypt.compareSync(args.password, user.password) || user.tipo !== TIPO_USER.ADMIN) {
        throw new Error('Wrong credentials', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }

      const userForToken = {
        id: user._id,
        dni: user.dni
      }

      const cookies = cookie.serialize('token', jwt.sign(userForToken, process.env.JWT_SECRET), {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week,
        sameSite: 'none'
      })

      context.res.setHeader('Set-Cookie', cookies)

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET)
      }
    },

    login: async (parent, args, context) => {
      const user = await User.findOne({ dni: args.dni })
      // console.log('login')
      if (!user || !bcrypt.compareSync(args.password, user.password)) {
        throw new Error('Wrong credentials', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }

      const userForToken = {
        id: user._id,
        dni: user.dni
      }

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET)
      }
    },

    paqueteid: async (parent, args, context) => {
      // console.log('paqueteid')
      const user = context.currentUser
      if (!user) {
        throw new Error('Authentication required')
      }
      const paquete = await Paquete.findById(args.id)
      return paquete
    },
    updatePaquete: async (parent, args, context) => {
      // console.log('updatePaquete')
      const user = context.currentUser
      if (!user) {
        throw new Error('Authentication required')
      }
      // const paquete = await Paquete.findByIdAndUpdate(args.id, { estado: args.estado })
      const paquete = await Paquete.findById(args.id)

      
      if(args.estado === '___') {
        return paquete
      }

      paquete.estado = args.estado
      await paquete.save()

      pubsub.publish('PAQUETE_UPDATED', { paqueteUpdated: paquete })

      return paquete
    },
    realtimeUbicacion: async (parent, args, context) => {
      const user = context.currentUser
      if (!user) {
        throw new Error('Authentication required')
      }
      // const unidad = await Unidad.findOne({ chofer_id: user._id })
      // unidad.ubicacion = { latitud: args.latitud, longitud: args.longitud, altitud: args.altitud }
      // await unidad.save()
      // return unidad.ubicacion
      
      console.log('realtimeUbicacion', args)
      return { latitud: args.latitud, longitud: args.longitud, user_id: user._id }
    },
  },
  Ruta: {
    paquetes: async (root) => {
      // const paquetes = await Promise.all(root.paquetes.map(async (paquete) => {
      //   const p = await Paquete.findById(paquete._id);
      //   return p;
      // }));
      return root.paquetes.map(async (paquete) => {
        const p = await Paquete.findById(paquete._id)
        return p
      })
    },
    chofer: async (root) => {
      const chofer = await User.findById(root.chofer_id)
      return chofer
    },
    unidad: async (root) => {
      const unidad = await Unidad.findById(root.unidad_id)
      return unidad
    },
  },
  Paquete: {
    ruta: async (root) => {

      const ruta = await Ruta.findOne({ paquetes: { $elemMatch: { _id: root._id } } })
      return ruta
    },
    nombre: async (root) => {
      
      return nombres[Math.floor(Math.random() * nombres.length)]
    },
    telefono: async (root) => {
      return Math.floor(Math.random() * 900000000 + 100000000)
    },
  },
  Subscription: {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
    },
    paqueteUpdated: {
      subscribe: () => pubsub.asyncIterator(['PAQUETE_UPDATED']),
    },
    // pantallaLCD:{
    //   subscribe: () => pubsub.asyncIterator(['PANTALLA_LCD']),
    // }
  },
}