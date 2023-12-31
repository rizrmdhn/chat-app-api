import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Message from 'App/Models/Message'
import * as nanoid from 'nanoid'

export default class MessageFriendsController {
  public async index({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const friendId = params.id

    try {
      const messages = await Message.query()
        .where('sender_id', userId)
        .where('receiver_id', friendId)
        .orWhere('sender_id', friendId)
        .where('receiver_id', userId)
        .where('is_deleted', false)
        .preload('sender', (query) => {
          query.select(['id', 'name', 'username', 'status', 'about_me', 'avatar'])
        })
        .preload('receiver', (query) => {
          query.select(['id', 'name', 'username', 'status', 'about_me', 'avatar'])
        })
        .orderBy('created_at', 'asc')

      if (!messages) {
        return response.notFound({
          meta: {
            status: 404,
            message: 'Message not found',
          },
        })
      }

      messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.isRead = true
        }
        message.save()
      })

      return response.ok({
        meta: {
          status: 200,
          message: 'Success',
        },
        data: messages,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          meta: {
            status: 404,
            message: 'Message not found',
          },
        })
      }

      return response.internalServerError({
        meta: {
          status: 500,
          message: 'Internal server error',
        },
      })
    }
  }

  public async store({ auth, params, request, response }: HttpContextContract) {
    const { content } = request.only(['content'])
    const userId = auth.use('api').user!.id
    const friendId = params.id

    const contentSchema = schema.create({
      content: schema.string([rules.maxLength(1000), rules.minLength(1), rules.required()]),
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
      senderId: userId,
      receiverId: friendId,
      message: content,
      isRead: false,
      isEdited: false,
      isDeleted: false,
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
    message.isEdited = true

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
