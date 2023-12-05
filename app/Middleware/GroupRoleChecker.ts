import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class GroupRoleChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id
    const groupId = params.id

    const groupRole = await Database.from('group_roles')
      .where('group_id', groupId)
      .andWhere('member_id', userId)
      .join('roles', 'group_roles.role_id', '=', 'roles.id')
      .select(['roles.name'])
      .first()

    if (!groupRole) {
      return response.unauthorized({
        meta: {
          status: 401,
          message: 'Unauthorized you are not a member of this group',
        },
      })
    }

    if (groupRole.name !== 'admin' && groupRole.name !== 'moderator') {
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
