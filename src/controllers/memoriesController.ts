import { FastifyRequest, FastifyReply } from 'fastify'
import { client } from '../lib/prisma'
import { z } from 'zod'

export class MemoriesController {
  static async findMemories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const memories = await client.memory.findMany({
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
          userId: '1fad6c54-d8af-47c1-ae58-78f97f35adf1'
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

      const modified_memory = await client.memory.update({
        where: {
          id
        },
        data: {
          content,
          coverUrl,
          isPublic
        }
      })

      return reply.status(200).send(modified_memory)
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
