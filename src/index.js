import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import cors from 'cors'
import dotenv from 'dotenv'
import { schema } from './apollo/apollo.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api/graphql',
})

const getDynamicContext = async (req, res, args) => {
  if (req.connectionParams.authentication) {
    const currentUser = await findUser(req.connectionParams.authentication);
    console.log('getDynamicContext')
    return { currentUser };
  }
  return { currentUser: null };
};

const serverCleanup = useServer({
  schema,
  context: async (req, res, args) => {
    const e = 'ssdfsdfsdf'
    return e
  }
}, wsServer)

const server = new ApolloServer({
  schema,
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

console.log({ PORT })

await server.start()

app.use('/api/graphql', cors({
  origin: "http://localhost:4000",
  credentials: true
}), express.json(), expressMiddleware(server))

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/api/graphql`)
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/graphql`)
})