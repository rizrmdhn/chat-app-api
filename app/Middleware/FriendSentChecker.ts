import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseHelpers from 'App/Helpers/ResponseHelpers'
import Friend from 'App/Models/Friend'
import FriendRequest from 'App/Models/FriendRequest'

export default class FriendSentChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const responseHelpers = new ResponseHelpers()
    const userId = auth.use('api').user!.id

    if (userId === params.id) {
      return response.badRequest(
        responseHelpers.badRequestResponse('You cannot send friend request to yourself')
      )
    }

    const friendRequest = await FriendRequest.query()
      .where('sender_id', userId)
      .where('receiver_id', params.id)
      .first()

    if (friendRequest) {
      return response.badRequest(
        responseHelpers.badRequestResponse(
          'You have already sent friend request to this user or this user has sent friend request to you'
        )
      )
    }

    const isInFriendList = await Friend.query()
      .where('user_id', userId)
      .where('friend_id', params.id)
      .orWhere('user_id', params.id)
      .where('friend_id', userId)
      .first()

    if (isInFriendList) {
      return response.badRequest(
        responseHelpers.badRequestResponse('You are already friends with this user')
      )
    }

    await next()
  }
}
