import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import axios from 'axios'
import { client } from '../lib/prisma'
import { app } from '../server'

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const bodySchema = z.object({
        code: z.string()
      })

      const { code } = bodySchema.parse(request.body)

      const accessTokenResponse = await axios.post('https://github.com/login/oauth/access_token', null, {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        },
        headers: {
          Accept: 'application/json'
        }
      })

      const { access_token } = accessTokenResponse.data

      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })

      const userSchema = z.object({
        id: z.number(),
        login: z.string(),
        name: z.string(),
        avatar_url: z.string().url()
      })

      const userData = userSchema.parse(userResponse.data)

      let user = await client.user.findUnique({
        where: {
          githubId: userData.id
        }
      })

      if (!user) {
        user = await client.user.create({
          data: {
            githubId: userData.id,
            login: userData.login,
            name: userData.name,
            avatarUrl: userData.avatar_url
          }
        })
      }

      const token = app.jwt.sign(
        {
          name: user.name,
          avatar_url: user.avatarUrl
        },
        {
          sub: user.id,
          expiresIn: '30 days'
        }
      )

      return reply.status(200).send({ token })
    } catch (err) {
      return reply.status(401).send('Unauthorized!')
    }
  }
}
