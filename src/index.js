import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4'
import { WebSocketServer } from 'ws'
import { ApolloServer } from '@apollo/server'
import { createServer } from 'http'
import { useServer } from 'graphql-ws/lib/use/ws'
import { schema } from './apollo/apollo.js'
import { User } from './models/User.js'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()
app.use(cookieParser())
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api/graphql',
})

const serverCleanup = useServer({
  schema,
  context: async (ctx, msg, args) => {

    return { ctx, msg, args };
  },
}, wsServer)

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await server.start()

const whitlist = [
  'http://localhost:4000',
  'https://1route.aguiarveliz.com',
  'http://127.0.0.1:3000',
  'http://192.168.1.69:4000',
]

app.post('/api/ping')

app.use('/api/graphql', cors({
  origin: whitlist,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie', 'Origin', 'Accept', 'X-Requested-With', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'Access-Control-Max-Age', 'Access-Control-Expose-Headers', 'Access-Control-Request-Headers', 'Access-Control-Request-Method'],
}), express.json(), expressMiddleware(server, {
  context: async ({ req, res }) => {


    const auth = req ? req.headers.authorization : null
    const reqCookies = req.headers.cookie

    // console.log({auth})

    if (auth && auth.toLowerCase().startsWith('bearer ')) {

      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )

      const currentUser = await User.findById(decodedToken.id)

      console.log({ user: currentUser._id })
      return { currentUser, req, res }
    }
    
    if (reqCookies && reqCookies.toLocaleLowerCase().startsWith('token=')) {
      const decodedToken = jwt.verify(
        reqCookies.substring(6), process.env.JWT_SECRET
        )
        
        const currentUser = await User.findById(decodedToken.id)
        console.log({ user: currentUser._id })

      return { currentUser, req, res }
    }

    return { req, res }
  }
}))

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/api/graphql`)
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/graphql`)
})