import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/authController'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (req, rep) => await AuthController.register(req, rep))
}
