import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const app = fastify()
const port = Number(process.env.PORT)

app.register(cors, {
  origin: process.env.CORS_ORIGIN
})
app.register(jwt, {
  secret: String(process.env.GITHUB_CLIENT_SECRET)
})
app.register(memoriesRoutes)
app.register(authRoutes)

app
  .listen({
    port
  })
  .then(() => console.log(`Server running on http://localhost:${port}`))

export { app }
