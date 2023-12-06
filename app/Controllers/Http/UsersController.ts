import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import * as nanoid from 'nanoid'

export default class UsersController {
  public async index({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id

    const users = await User.query()
      .select(['id', 'name', 'username', 'email', 'status', 'aboutMe', 'avatar'])
      .where('id', '!=', userId)

    users.forEach((user) => {
      if (user.avatar) {
        user.avatar = `${Env.get('APP_URL')}/uploads/${user.avatar}`
      }
    })

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: users,
    })
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['name', 'username', 'email', 'password'])

    const registerSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.maxLength(100),
        rules.minLength(3),
        rules.required(),
      ]),
      username: schema.string({ trim: true }, [
        rules.minLength(3),
        rules.maxLength(100),
        rules.required(),
        rules.unique({ table: 'users', column: 'username' }),
      ]),
      email: schema.string({ trim: true }, [
        rules.maxLength(100),
        rules.email(),
        rules.required(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [rules.minLength(8)]),
    })

    const registerCustomMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'The maximum length of name is 100 characters',
      'name.minLength': 'The minimum length of name is 3 characters',
      'username.required': 'Username is required',
      'username.minLength': 'The minimum length of username is 3 characters',
      'username.maxLength': 'The maximum length of username is 100 characters',
      'username.unique': 'Username is already taken',
      'email.required': 'Email is required',
      'email.email': 'Email is not valid',
      'email.maxLength': 'The maximum length of email is 100 characters',
      'email.unique': 'Email is already taken',
      'password.minLength': 'The password must be at least 8 characters',
    }

    try {
      await request.validate({
        schema: registerSchema,
        messages: registerCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
    }

    const user = await User.create({
      id: `user-${nanoid.nanoid(16)}`,
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
    })

    return response.created({
      meta: {
        status: 201,
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

  public async show({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user?.id
    if (!userId) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Unauthorized',
        },
      })
    }

    const user = await User.query()
      .select(['id', 'name', 'username', 'email', 'status', 'aboutMe', 'avatar'])
      .where('id', userId)
      .first()

    if (!user) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'User not found',
        },
      })
    }

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: user,
    })
  }

  public async updateName({ auth, request, response }: HttpContextContract) {
    const { name } = request.only(['name'])

    const userId = auth.use('api').user!.id

    const updateSchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(100), rules.minLength(3)]),
    })

    const updateCustomMessages = {
      'name.maxLength': 'The maximum length of name is 100 characters',
      'name.minLength': 'The minimum length of name is 3 characters',
    }

    try {
      await request.validate({
        schema: updateSchema,
        messages: updateCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
    }

    const user = await User.find(userId)

    if (!user) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'User not found',
        },
      })
    }

    user.name = name

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

  public async updateAboutMe({ auth, request, response }: HttpContextContract) {
    const { aboutMe } = request.only(['aboutMe'])

    const userId = auth.use('api').user!.id

    const updateSchema = schema.create({
      aboutMe: schema.string({ trim: true }, [rules.maxLength(1000)]),
    })

    const updateCustomMessages = {
      'aboutMe.maxLength': 'The maximum length of about me is 1000 characters',
    }

    try {
      await request.validate({
        schema: updateSchema,
        messages: updateCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
    }

    const user = await User.find(userId)

    if (!user) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'User not found',
        },
      })
    }

    user.aboutMe = aboutMe

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

  public async updateStatus({ auth, request, response }: HttpContextContract) {
    const { status } = request.only(['status'])

    const userId = auth.use('api').user!.id

    const updateSchema = schema.create({
      status: schema.string({ trim: true }, [rules.maxLength(100)]),
    })

    const updateCustomMessages = {
      'status.maxLength': 'The maximum length of status is 100 characters',
    }

    try {
      await request.validate({
        schema: updateSchema,
        messages: updateCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Validation error',
        },
        data: error.messages,
      })
    }

    const user = await User.find(userId)

    if (!user) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'User not found',
        },
      })
    }

    user.status = status

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
