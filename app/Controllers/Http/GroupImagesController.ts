import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import { schema } from '@ioc:Adonis/Core/Validator'
import Group from 'App/Models/Group'
import Env from '@ioc:Adonis/Core/Env'

export default class GroupImagesController {
  public async store({ params, request, response }: HttpContextContract) {
    const groupId = params.id

    if (!groupId) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Group id is required',
        },
      })
    }

    const groupImage = request.file('groupImage', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    const groupImageSchema = schema.create({
      groupImage: schema.file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      }),
    })

    const groupImageCustomMessages = {
      'groupImage.file.extname': 'Group image must be a valid image (jpg, jpeg, png)',
      'groupImage.file.size': 'Group image must be less than 2MB',
    }

    if (!groupImage) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Group image is required',
        },
      })
    }

    try {
      await request.validate({
        schema: groupImageSchema,
        messages: groupImageCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: error.message,
        },
      })
    }

    const groupImageName = `${new Date().getTime()}-${groupId}.${groupImage?.extname}`

    await groupImage?.move(Application.tmpPath('uploads/group-image'), {
      name: groupImageName,
    })

    const group = await Group.findOrFail(groupId)

    group.groupImage = groupImageName

    await group.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Group image uploaded successfully',
      },
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        groupImage: `${Env.get('APP_URL')}/uploads/group-image/${group.groupImage}`,
        isPrivate: group.isPrivate,
        inviteLink: group.inviteLink,
        createdBy: group.createdBy,
        updatedBy: group.updatedBy,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    })
  }
}
