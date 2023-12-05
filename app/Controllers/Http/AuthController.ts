import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const { username, password } = request.only(['username', 'password'])

    const loginSchema = schema.create({
      username: schema.string({ trim: true }, [
        rules.minLength(3),
        rules.maxLength(100),
        rules.required(),
      ]),
      password: schema.string({ trim: true }, [rules.minLength(8)]),
    })

    const loginSchemaMessages = {
      'username.required': 'Username is required',
      'username.minLength': 'Username must be at least 3 characters',
      'username.maxLength': 'Username must be less than 100 characters',
      'password.required': 'Password is required',
      'password.minLength': 'Password must be at least 8 characters',
    }

    try {
      await request.validate({
        schema: loginSchema,
        messages: loginSchemaMessages,
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

    const token = await auth.use('api').attempt(username, password, {
      expiresIn: '7days',
    })

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: token.toJSON(),
    })
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }
}
