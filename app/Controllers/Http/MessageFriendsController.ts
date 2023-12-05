import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Message from 'App/Models/Message'
import * as nanoid from 'nanoid'

export default class MessageFriendsController {
  public async store({ auth, params, request, response }: HttpContextContract) {
    const { content } = request.only(['content'])
    const userId = auth.use('api').user!.id
    const friendId = params.id

    const contentSchema = schema.create({
      content: schema.string({ trim: true }, [
        rules.maxLength(1000),
        rules.minLength(1),
        rules.required(),
      ]),
    })

    const contentCustomMessages = {
      'content.required': 'Content is required',
      'content.maxLength': 'The maximum length of content is 1000 characters',
      'content.minLength': 'The minimum length of content is 1 character',
    }

    try {
      await request.validate({
        schema: contentSchema,
        messages: contentCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Bad Request',
        },
        data: error.messages,
      })
    }

    const message = await Message.create({
      id: `message-${nanoid.nanoid(16)}`,
      receiverId: friendId,
      senderId: userId,
      message: content,
    })

    return response.created({
      meta: {
        status: 201,
        message: 'Success',
      },
      data: message,
    })
  }

  public async update({ auth, params, response, request }: HttpContextContract) {
    const { content } = request.only(['content'])
    const userId = auth.use('api').user!.id
    const friendId = params.id
    const messageId = params.messageId

    const contentSchema = schema.create({
      content: schema.string({ trim: true }, [
        rules.maxLength(1000),
        rules.minLength(1),
        rules.required(),
      ]),
    })

    const contentCustomMessages = {
      'content.required': 'Content is required',
      'content.maxLength': 'The maximum length of content is 1000 characters',
      'content.minLength': 'The minimum length of content is 1 character',
    }

    try {
      await request.validate({
        schema: contentSchema,
        messages: contentCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Bad Request',
        },
        data: error.messages,
      })
    }

    const message = await Message.query()
      .where('sender_id', userId)
      .where('receiver_id', friendId)
      .where('id', messageId)
      .first()

    if (!message) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Message not found',
        },
      })
    }

    message.message = content

    await message.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: message,
    })
  }

  public async softDelete({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const friendId = params.id
    const messageId = params.messageId

    const message = await Message.query()
      .where('sender_id', userId)
      .where('receiver_id', friendId)
      .where('id', messageId)
      .first()

    if (!message) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Message not found',
        },
      })
    }

    message.isDeleted = true

    await message.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: message,
    })
  }

  public async restore({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const friendId = params.id
    const messageId = params.messageId

    const message = await Message.query()
      .where('sender_id', userId)
      .where('receiver_id', friendId)
      .where('id', messageId)
      .first()

    if (!message) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Message not found',
        },
      })
    }

    message.isDeleted = false

    await message.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: message,
    })
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const friendId = params.id
    const messageId = params.messageId

    const message = await Message.query()
      .where('sender_id', userId)
      .where('receiver_id', friendId)
      .where('id', messageId)
      .first()

    if (!message) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Message not found',
        },
      })
    }

    await message.delete()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }
}
