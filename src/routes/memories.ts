import { FastifyInstance } from 'fastify'
import { MemoriesController } from '../controllers/memoriesController'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async request => {
    await request.jwtVerify()
  })

  app.get('/memories', async (req, rep) => await MemoriesController.findMemories(req, rep))
  app.get('/memories/:id', async (req, rep) => await MemoriesController.findMemory(req, rep))
  app.post('/memories', async (req, rep) => await MemoriesController.createMemory(req, rep))
  app.put('/memories/:id', async (req, rep) => await MemoriesController.updateMemory(req, rep))
  app.delete('/memories/:id', async (req, rep) => await MemoriesController.deleteMemory(req, rep))
}
