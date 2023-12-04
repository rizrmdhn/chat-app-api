import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FriendRequest from 'App/Models/FriendRequest'
import User from 'App/Models/User'
import Friend from 'App/Models/Friend'
import * as nanoid from 'nanoid'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'

export default class FriendsController {
  public async index({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id

    let friends = [] as User[]

    friends = await Database.from('friends')
      .join('users', 'friends.user_id', '=', 'users.id')
      .join('users as friend', 'friends.friend_id', '=', 'friend.id')
      .select(
        'friend.id as id',
        'friend.name as name',
        'friend.username as username',
        'friend.status as status',
        'friend.about_me as about_me',
        'friend.avatar as avatar'
      )
      .where('user_id', userId)
      .returning('*')
      .then((friend) => {
        friend.forEach((friend) => {
          if (friend.avatar) {
            friend.avatar = `${Env.get('APP_URL')}/uploads/${friend.avatar}`
          }
        })
        return friend
      })

    if (friends.length === 0) {
      friends = await Database.from('friends')
        .join('users', 'friends.friend_id', '=', 'users.id')
        .join('users as friend', 'friends.user_id', '=', 'friend.id')
        .select(
          'friend.id as id',
          'friend.name as name',
          'friend.username as username',
          'friend.status as status',
          'friend.about_me as about_me',
          'friend.avatar as avatar'
        )
        .where('friend_id', userId)
        .returning('*')
        .then((friend) => {
          friend.forEach((friend) => {
            if (friend.avatar) {
              friend.avatar = `${Env.get('APP_URL')}/uploads/${friend.avatar}`
            }
          })
          return friend
        })
    }

    const friendRequests = await Database.from('friend_requests')
      .join('users', function () {
        this.on('friend_requests.sender_id', '=', 'users.id')
      })
      .where('friend_requests.receiver_id', userId)
      .select(
        'users.id as id',
        'users.name as name',
        'users.username as username',
        'users.status as status',
        'users.about_me as about_me',
        'users.avatar as avatar'
      )
      .returning('*')
      .then((friendRequest) => {
        friendRequest.forEach((friendRequest) => {
          if (friendRequest.avatar) {
            friendRequest.avatar = `${Env.get('APP_URL')}/uploads/${friendRequest.avatar}`
          }
        })
        return friendRequest
      })

    const sentRequests = await Database.from('friend_requests')
      .join('users', function () {
        this.on('friend_requests.receiver_id', '=', 'users.id')
      })
      .where('friend_requests.sender_id', userId)
      .select(
        'users.id as id',
        'users.name as name',
        'users.username as username',
        'users.status as status',
        'users.about_me as about_me',
        'users.avatar as avatar'
      )
      .returning('*')
      .then((sentRequest) => {
        sentRequest.forEach((sentRequest) => {
          if (sentRequest.avatar) {
            sentRequest.avatar = `${Env.get('APP_URL')}/uploads/${sentRequest.avatar}`
          }
        })
        return sentRequest
      })

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: {
        friends,
        friend_requests: friendRequests,
        sent_requests: sentRequests,
      },
    })
  }
  public async store({ auth, params, response }: HttpContextContract) {
    if (!params.id) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend ID is required',
        },
      })
    }

    const isUserAvailable = await User.find(params.id)

    if (!isUserAvailable) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'User not found',
        },
      })
    }

    const userId = auth.use('api').user!.id

    const friendRequest = await FriendRequest.create({
      id: `friendRequest-${nanoid.nanoid(16)}`,
      sender_id: userId,
      receiver_id: params.id,
    })

    return response.created({
      meta: {
        status: 201,
        message: 'Success',
      },
      data: friendRequest,
    })
  }

  public async accept({ auth, params, response }: HttpContextContract) {
    if (!params.id) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend ID is required',
        },
      })
    }

    const userId = auth.use('api').user!.id

    const friendRequest = await FriendRequest.query()
      .where('sender_id', params.id)
      .where('receiver_id', userId)
      .first()

    if (!friendRequest) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend request not found',
        },
      })
    }

    await FriendRequest.query().where('sender_id', params.id).where('receiver_id', userId).delete()

    const friend = await Friend.create({
      id: `friend-${nanoid.nanoid(16)}`,
      user_id: userId,
      friend_id: params.id,
    })

    return response.created({
      meta: {
        status: 201,
        message: 'Success',
      },
      data: friend,
    })
  }

  public async reject({ auth, params, response }: HttpContextContract) {
    if (!params.id) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend ID is required',
        },
      })
    }

    const userId = auth.use('api').user!.id

    const friendRequest = await FriendRequest.query()
      .where('sender_id', params.id)
      .where('receiver_id', userId)
      .first()

    if (!friendRequest) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend request not found',
        },
      })
    }

    await FriendRequest.query().where('sender_id', params.id).where('receiver_id', userId).delete()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }

  public async cancel({ auth, params, response }: HttpContextContract) {
    if (!params.id) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend ID is required',
        },
      })
    }

    const userId = auth.use('api').user!.id

    const friendRequest = await FriendRequest.query()
      .where('sender_id', userId)
      .where('receiver_id', params.id)
      .first()

    if (!friendRequest) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend request not found',
        },
      })
    }

    await FriendRequest.query().where('sender_id', userId).where('receiver_id', params.id).delete()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    if (!params.id) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend ID is required',
        },
      })
    }

    const userId = auth.use('api').user!.id

    const friend = await Friend.query()
      .where('user_id', userId)
      .where('friend_id', params.id)
      .orWhere('user_id', params.id)
      .where('friend_id', userId)
      .first()

    if (!friend) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Friend not found',
        },
      })
    }

    await Friend.query().where('user_id', userId).where('friend_id', params.id).delete()

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  }
}
