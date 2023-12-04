import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AvatarsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    const avatarSchema = schema.create({
      avatar: schema.file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      }),
    })

    const avatarCustomMessages = {
      'avatar.file.extname': 'Avatar must be a valid image (jpg, jpeg, png)',
      'avatar.file.size': 'Avatar must be less than 2MB',
    }

    if (!avatar) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Avatar is required',
        },
      })
    }

    try {
      await request.validate({
        schema: avatarSchema,
        messages: avatarCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: error.message,
        },
      })
    }

    const avatarName = `${new Date().getTime()}-${userId}.${avatar?.extname}`

    await avatar?.move(Application.tmpPath('uploads'), {
      name: avatarName,
    })

    const user = await User.findOrFail(userId)

    user.avatar = avatarName

    await user.save()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        aboutMe: user.aboutMe,
        status: user.status,
      },
    })
  }
}
