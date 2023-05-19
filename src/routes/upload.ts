import { FastifyInstance } from 'fastify'
import { UploadController } from '../controllers/uploadController'

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (req, rep) => await UploadController.upload(req, rep))
}
