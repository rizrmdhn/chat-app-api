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

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async softDelete({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
