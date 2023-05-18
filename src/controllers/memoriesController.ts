import { FastifyRequest, FastifyReply } from 'fastify'
import { client } from '../lib/prisma'
import { z } from 'zod'

export class MemoriesController {
  static async findMemories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const memories = await client.memory.findMany({
        where: {
          userId: request.user.sub
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      const parsed_memories = memories.map(memory => ({
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...')
      }))

      return reply.status(200).send(parsed_memories)
    } catch (err) {
      return reply.status(400).send('Unexpected Error')
    }
  }

  static async findMemory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(request.params)

      const memory = await client.memory.findUniqueOrThrow({
        where: {
          id
        }
      })

      if (!memory.isPublic && memory.userId !== request.user.sub) {
        return reply.status(401).send('Unauthorized!')
      }

      return reply.status(200).send(memory)
    } catch (err) {
      return reply.status(400).send('Unexpected Error')
    }
  }

  static async createMemory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false)
      })

      const { content, isPublic, coverUrl } = bodySchema.parse(request.body)

      const new_memory = await client.memory.create({
        data: {
          content,
          coverUrl,
          isPublic,
          userId: request.user.sub
        }
      })

      return reply.status(201).send(new_memory)
    } catch (err) {
      return reply.status(400).send('Unexpected Error')
    }
  }

  static async updateMemory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(request.params)

      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false)
      })

      const { content, isPublic, coverUrl } = bodySchema.parse(request.body)

      let memory = await client.memory.findUniqueOrThrow({
        where: {
          id
        }
      })

      if (memory.userId !== request.user.sub) {
        return reply.status(401).send('Unauthorized!')
      }

      memory = await client.memory.update({
        where: {
          id
        },
        data: {
          content,
          coverUrl,
          isPublic
        }
      })

      return reply.status(200).send(memory)
    } catch (err) {
      return reply.status(400).send('Unexpected Error')
    }
  }

  static async deleteMemory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid()
      })

      const { id } = paramsSchema.parse(request.params)

      const memory = await client.memory.findUniqueOrThrow({
        where: {
          id
        }
      })

      if (memory.userId !== request.user.sub) {
        return reply.status(401).send('Unauthorized!')
      }

      await client.memory.delete({
        where: {
          id
        }
      })
    } catch (err) {
      return reply.status(400).send('Unexpected Error')
    }
  }
}
