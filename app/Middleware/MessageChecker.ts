import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ResponseHelpers from 'App/Helpers/ResponseHelpers'

export default class MessageChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // Helpers
    const responseHelpers = new ResponseHelpers()
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id
    const friendId = params.id

    if (!friendId) {
      return response.badRequest(responseHelpers.badRequestResponse('Friend id is required'))
    }

    if (userId === friendId) {
      return response.forbidden(
        responseHelpers.forbiddenResponse('You cannot send message to yourself')
      )
    }

    const isFriendInFriendList = await Database.from('friends')
      .where('user_id', userId)
      .andWhere('friend_id', friendId)
      .orWhere('user_id', friendId)
      .andWhere('friend_id', userId)
      .first()

    if (!isFriendInFriendList) {
      return response.forbidden(
        responseHelpers.forbiddenResponse(
          'You cannot send message to this user because you are not friend with this user'
        )
      )
    }

    await next()
  }
}
