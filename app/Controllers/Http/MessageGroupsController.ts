import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Group from 'App/Models/Group'
import GroupMessage from 'App/Models/GroupMessage'
import * as nanoid from 'nanoid'

export default class MessageGroupsController {
  public async index({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id

    // get group users count
    const groupUsersCount = await Group.query()
      .where('id', groupId)
      .preload('groupMembers')
      .firstOrFail()

    const memberList = groupUsersCount.groupMembers.filter((member) => {
      return member.memberId !== userId
    })

    const messages = await GroupMessage.query()
      .where('group_id', groupId)
      .where('is_deleted', false)
      .preload('sender', (query) => {
        query.select(['id', 'name', 'username', 'avatar'])
      })
      .orderBy('created_at', 'asc')

    messages.forEach((message) => {
      if (message.senderId !== userId) {
        if (!message.readBy[userId]) {
          message.readBy[userId] = true
        }

        if (Object.keys(message.readBy).length === memberList.length) {
          message.isRead = true
        }

        message.save()
      }
    })

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: messages,
    })
  }

  public async store({ auth, params, request, response }: HttpContextContract) {
    const { content } = request.only(['content'])
    const userId = auth.use('api').user!.id
    const groupId = params.id

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

    const groupMessage = await GroupMessage.create({
      id: `group-message-${nanoid.nanoid(16)}`,
      groupId: groupId,
      senderId: userId,
      message: content,
    })

    return response.created({
      meta: {
        status: 201,
        message: 'Success',
      },
      data: groupMessage,
    })
  }

  public async update({ auth, params, response, request }: HttpContextContract) {
    const { content } = request.only(['content'])
    const userId = auth.use('api').user!.id
    const groupId = params.id
    const messageId = params.messageId

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

    const groupMessage = await GroupMessage.query()
      .where('id', messageId)
      .where('group_id', groupId)
      .where('sender_id', userId)
      .first()

    if (!groupMessage) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Not Found',
        },
        data: 'Message not found or already deleted',
      })
    }

    groupMessage.message = content
    groupMessage.isEdited = true

    await groupMessage.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: groupMessage,
    })
  }

  public async softDelete({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id
    const messageId = params.messageId

    const groupMessage = await GroupMessage.query()
      .where('id', messageId)
      .where('group_id', groupId)
      .where('sender_id', userId)
      .first()

    if (!groupMessage) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Not Found',
        },
        data: 'Message not found or already deleted',
      })
    }

    groupMessage.isEdited = true
    groupMessage.isDeleted = true

    await groupMessage.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: groupMessage,
    })
  }

  public async restore({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id
    const messageId = params.messageId

    const groupMessage = await GroupMessage.query()
      .where('id', messageId)
      .where('group_id', groupId)
      .where('sender_id', userId)
      .first()

    if (!groupMessage) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Not Found',
        },
        data: 'Message not found or already deleted',
      })
    }

    if (groupMessage.isEdited === false) {
      groupMessage.isEdited = true
    }
    groupMessage.isDeleted = false

    await groupMessage.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: groupMessage,
    })
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id
    const messageId = params.messageId

    const groupMessage = await GroupMessage.query()
      .where('id', messageId)
      .where('group_id', groupId)
      .where('sender_id', userId)
      .first()

    if (!groupMessage) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Not Found',
        },
        data: 'Message not found or already deleted',
      })
    }

    await groupMessage.delete()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: 'Message deleted permanently',
    })
  }
}
