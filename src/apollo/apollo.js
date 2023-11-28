import '../database/db.js'
import { makeExecutableSchema } from "@graphql-tools/schema"
import { typeDefs } from "./typeDef.js"
import { resolvers } from "./resolvers.js"

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})