import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'

import { memoriesRoutes } from './routes/memories'

const app = fastify()
const port = Number(process.env.PORT)

app.register(cors, {
  origin: process.env.CORS_ORIGIN
})
app.register(memoriesRoutes)

app
  .listen({
    port
  })
  .then(() => console.log(`Server running on http://localhost:${port}`))
