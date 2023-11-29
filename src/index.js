import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4'
import { WebSocketServer } from 'ws'
import { ApolloServer } from '@apollo/server'
import { createServer } from 'http'
import { useServer } from 'graphql-ws/lib/use/ws'
import { schema } from './apollo/apollo.js'
import { User } from './models/User.js'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import jwt from 'jsonwebtoken'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api/graphql',
})

const serverCleanup = useServer({
  schema,
  context: async (ctx, msg, args) => {
    
    return {ctx, msg, args};
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

app.use('/api/graphql', cors({
  origin: "http://localhost:4000",
  credentials: true
}), express.json(), expressMiddleware(server, {
  context: async ({ req, res }) => {

    const auth = req ? req.headers.authorization : null
    const reqCookies = req.headers.cookie

    if (auth && auth.toLowerCase().startsWith('bearer ')) {

      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )

      const currentUser = await User.findById(decodedToken.id)

      return { currentUser, req, res }
    }

    if (reqCookies && reqCookies.toLocaleLowerCase().startsWith('token=')) {
      const decodedToken = jwt.verify(
        reqCookies.substring(6), process.env.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)

      return { currentUser, req, res }
    }

    return { req, res }
  }
}))

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/api/graphql`)
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/graphql`)
})