import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import fs from 'fs'

export default class AvatarChecker {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id

    const oldAvatar = await User.query().select('avatar').where('id', userId).firstOrFail()

    if (oldAvatar.avatar) {
      // Delete old avatar
      fs.unlinkSync(`./tmp/uploads/${oldAvatar.avatar}`)
    }

    await next()
  }
}
