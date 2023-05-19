import { randomUUID } from 'crypto'
import { extname } from 'node:path'
import { FastifyReply, FastifyRequest } from 'fastify'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import { pipeline } from 'stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export class UploadController {
  static async upload(request: FastifyRequest, reply: FastifyReply) {
    try {
      const upload = await request.file({
        limits: {
          fileSize: 5_242_880
        }
      })

      if (!upload) {
        return reply.status(401).send()
      }

      const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
      const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

      if (!isValidFileFormat) {
        return reply.status(401).send()
      }

      const fileId = randomUUID()
      const extension = extname(upload.filename)

      const fileName = fileId.concat(extension)

      const writeStream = createWriteStream(resolve(__dirname, '../../uploads/', fileName))

      await pump(upload.file, writeStream)

      const fullUrl = request.protocol.concat('://').concat(request.hostname)
      const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

      return reply.status(200).send({ fileUrl })
    } catch (err) {
      return reply.status(401).send('Unauthorized!')
    }
  }
}
