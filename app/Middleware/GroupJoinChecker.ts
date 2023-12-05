import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class GroupJoinChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id
    const groupInviteLink = params.link

    const groupMember = await Database.from('groups')
      .where('invite_link', groupInviteLink)
      .join('group_members', 'groups.id', '=', 'group_members.group_id')
      .andWhere('group_members.member_id', userId)
      .first()

    if (groupMember) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'You are already a member of this group',
        },
      })
    }

    await next()
  }
}
