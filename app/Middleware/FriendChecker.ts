import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseHelpers from 'App/Helpers/ResponseHelpers'
import User from 'App/Models/User'

export default class FriendChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id
    const friendId = params.id

    const responseHelpers = new ResponseHelpers()

    if (userId === friendId) {
      return response.badRequest(
        responseHelpers.badRequestResponse('You cannot send a friend request to yourself')
      )
    }

    const isInFriendList = await User.query()
      .whereHas('friends', (query) => {
        query.where('friend_id', friendId)
      })
      .where('id', userId)
      .first()

    if (isInFriendList) {
      return response.badRequest(
        responseHelpers.badRequestResponse('You are already friends with this user')
      )
    }

    await next()
  }
}
