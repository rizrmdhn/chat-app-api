import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FriendRequest from 'App/Models/FriendRequest'

export default class FriendRequestChecker {
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
      .where('sender_id', params.id)
      .where('receiver_id', userId)
      .first()

    if (friendRequest) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'This user has already sent you a friend request',
        },
      })
    }

    await next()
  }
}
