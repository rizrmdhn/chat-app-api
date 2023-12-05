import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DefaultsController {
  public async index({ response }: HttpContextContract) {
    return response.ok({
      meta: {
        status: 200,
        message: 'Welcome to Chat App API',
      },
      data: {
        name: 'Chat App API',
        version: '1.0.0',
      },
    })
  }
}
