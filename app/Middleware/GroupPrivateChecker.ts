import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'

export default class GroupPrivateChecker {
  public async handle({ params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const groupId = params.id

    const group = await Group.findOrFail(groupId)

    if (group.isPrivate) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Cannot join private group use invite link instead',
        },
      })
    }

    await next()
  }
}
