import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class GroupChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id
    const groupId = params.id || params.link

    const groupMember = await Database.from('group_members')
      .where('group_id', groupId)
      .andWhere('member_id', userId)
      .first()

    if (!groupMember) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Unauthorized you are not a member of this group',
        },
      })
    }

    await next()
  }
}
