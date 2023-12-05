import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ResponseHelpers from 'App/Helpers/ResponseHelpers'

export default class GroupMessageChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // Helpers
    const responseHelpers = new ResponseHelpers()
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id
    const groupId = params.id

    if (!groupId) {
      return response.badRequest(responseHelpers.badRequestResponse('Group id is required'))
    }

    const isGroupExist = await Database.from('groups').where('id', groupId).first()

    if (!isGroupExist) {
      return response.notFound(
        responseHelpers.notFoundResponse('Group not found or already deleted')
      )
    }

    const isUserInGroup = await Database.from('group_members')
      .where('group_id', groupId)
      .andWhere('member_id', userId)
      .first()

    if (!isUserInGroup) {
      return response.forbidden(
        responseHelpers.forbiddenResponse(
          'You cannot send message to this group because you are not member of this group'
        )
      )
    }

    await next()
  }
}
