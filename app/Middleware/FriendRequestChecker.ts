import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseHelpers from 'App/Helpers/ResponseHelpers'
import FriendRequest from 'App/Models/FriendRequest'

export default class FriendRequestChecker {
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
      .where('sender_id', params.id)
      .where('receiver_id', userId)
      .first()

    if (friendRequest) {
      return response.badRequest(
        responseHelpers.badRequestResponse(
          'You have already sent a friend request to this user or this user has sent a friend request to you'
        )
      )
    }

    await next()
  }
}
