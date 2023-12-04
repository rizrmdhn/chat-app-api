import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Friend from 'App/Models/Friend'
import FriendRequest from 'App/Models/FriendRequest'

export default class FriendSentChecker {
  public async handle({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const userId = auth.use('api').user!.id

    if (userId === params.id) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'You cannot send friend request to yourself',
        },
      })
    }

    const friendRequest = await FriendRequest.query()
      .where('sender_id', userId)
      .where('receiver_id', params.id)
      .first()

    if (friendRequest) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'You have already sent friend request to this user',
        },
      })
    }

    const isInFriendList = await Friend.query()
      .where('user_id', userId)
      .where('friend_id', params.id)
      .orWhere('user_id', params.id)
      .where('friend_id', userId)
      .first()

    if (isInFriendList) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'You are already friend with this user',
        },
      })
    }

    await next()
  }
}
