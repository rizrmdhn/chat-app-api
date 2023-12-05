import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
import * as nanoid from 'nanoid'
import Group from 'App/Models/Group'
import GroupMember from 'App/Models/GroupMember'

export default class GroupsController {
  public async index({ auth, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id

    const groups = await Database.from('group_members')
      .join('groups', 'group_members.group_id', '=', 'groups.id')
      .join('users', 'group_members.member_id', '=', 'users.id')
      .select(['groups.id', 'groups.name', 'groups.description', 'groups.group_image'])
      .where('group_members.member_id', userId)
      .returning('*')
      .then((result) => {
        return result.map((group) => {
          if (group.group_image) {
            group.group_image = `${Env.get('APP_URL')}/uploads/${group.group_image}`
          }

          return group
        })
      })

    return response.ok({
      meta: {
        status: 200,
        message: 'Success',
      },
      data: groups,
    })
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const { name, description, isPrivate } = request.only(['name', 'description', 'isPrivate'])

    const groupId = `group-${nanoid.nanoid(16)}`

    const groupSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.maxLength(100),
        rules.minLength(3),
        rules.required(),
      ]),
      description: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      isPrivate: schema.boolean.optional(),
    })

    const groupCustomMessages = {
      'name.required': 'Name is required',
      'name.maxLength': 'The maximum length of name is 100 characters',
      'name.minLength': 'The minimum length of name is 3 characters',
      'description.maxLength': 'The maximum length of description is 255 characters',
    }

    try {
      await request.validate({
        schema: groupSchema,
        messages: groupCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
    }

    const group = await Group.create({
      id: groupId,
      name: name || '',
      description: description || '',
      isPrivate: isPrivate || false,
      inviteLink: `group-invite-link-${nanoid.nanoid(16)}`,
      createdBy: userId,
      updatedBy: userId,
    })

    const groupMember = await GroupMember.create({
      id: `group-member-${nanoid.nanoid(16)}`,
      groupId,
      memberId: userId,
    })

    const adminRole = await Database.from('roles').where('name', 'admin').first()

    await groupMember.related('userRole').create({
      id: `group-role-${nanoid.nanoid(16)}`,
      groupId,
      memberId: userId,
      roleId: adminRole!.id,
    })

    return response.created({
      meta: {
        status: 201,
        message: 'Group created',
      },
      data: group,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const groupId = params.id

    try {
      const group = await Group.query()
        .where('id', groupId)
        .preload('groupMembers', (query) => {
          query
            .select(['member_id'])
            .preload('user', (query) => {
              query.select(['id', 'name', 'username', 'status', 'about_me', 'avatar'])
            })
            .preload('userRole', (query) => {
              query.select(['role_id']).preload('role', (query) => {
                query.select(['id', 'name'])
              })
            })
        })
        .firstOrFail()

      const serializedGroup = group.serialize()
      const { groupMembers } = serializedGroup

      groupMembers.forEach((groupMember) => {
        groupMember.user.avatar = groupMember.user.avatar
          ? `${Env.get('APP_URL')}/uploads/${groupMember.user.avatar}`
          : null
      })

      return response.ok({
        meta: {
          status: 200,
          message: 'Success',
        },
        data: serializedGroup,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          meta: {
            status: 404,
            message: 'Group not found',
          },
        })
      }
      return response.internalServerError({
        meta: {
          status: 500,
          message: 'Internal server error',
        },
      })
    }
  }

  public async update({ auth, params, request, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id
    const { name, description, isPrivate } = request.only(['name', 'description', 'isPrivate'])

    const groupSchema = schema.create({
      name: schema.string({ trim: true }, [rules.maxLength(100), rules.minLength(3)]),
      description: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      isPrivate: schema.boolean.optional(),
    })

    const groupCustomMessages = {
      'name.maxLength': 'The maximum length of name is 100 characters',
      'name.minLength': 'The minimum length of name is 3 characters',
      'description.maxLength': 'The maximum length of description is 255 characters',
    }

    try {
      await request.validate({
        schema: groupSchema,
        messages: groupCustomMessages,
      })
    } catch (error) {
      return response.badRequest({
        meta: {
          status: 400,
          message: error.messages,
        },
      })
    }

    try {
      const group = await Group.query()
        .where('id', groupId)
        .where('created_by', userId)
        .firstOrFail()

      group.name = name || group.name
      group.description = description || group.description
      group.isPrivate = isPrivate || group.isPrivate
      group.updatedBy = userId

      await group.save()

      return response.ok({
        meta: {
          status: 200,
          message: 'Success',
        },
        data: group,
      })
    } catch (error) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Group not found',
        },
      })
    }
  }

  public async joinByLink({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupInviteLink = params.link

    if (!groupInviteLink) {
      return response.badRequest({
        meta: {
          status: 400,
          message: 'Invite link is required',
        },
      })
    }

    try {
      const group = await Group.query().where('invite_link', groupInviteLink).firstOrFail()

      const groupMember = await GroupMember.create({
        id: `group-member-${nanoid.nanoid(16)}`,
        groupId: group.id,
        memberId: userId,
      })

      const memberRole = await Database.from('roles').where('name', 'member').first()

      await groupMember.related('userRole').create({
        id: `group-role-${nanoid.nanoid(16)}`,
        groupId: group.id,
        memberId: userId,
        roleId: memberRole!.id,
      })

      return response.created({
        meta: {
          status: 201,
          message: 'Success',
        },
        data: groupMember,
      })
    } catch (error) {
      return response.notFound({
        meta: {
          status: 404,
          message: error.message,
        },
      })
    }
  }

  public async leave({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id

    try {
      const groupMember = await GroupMember.query()
        .where('group_id', groupId)
        .where('member_id', userId)
        .firstOrFail()

      await groupMember.delete()

      const group = await Group.query().where('id', groupId).preload('groupMembers').firstOrFail()

      if (group.groupMembers.length === 0) {
        await group.delete()
      }

      return response.ok({
        meta: {
          status: 200,
          message: 'Success',
        },
      })
    } catch (error) {
      return response.notFound({
        meta: {
          status: 404,
          message: 'Group not found',
        },
      })
    }
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const userId = auth.use('api').user!.id
    const groupId = params.id

    try {
      const group = await Group.query()
        .where('id', groupId)
        .where('created_by', userId)
        .firstOrFail()

      await group.delete()

      return response.ok({
        meta: {
          status: 200,
          message: 'Success',
        },
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          meta: {
            status: 404,
            message: 'Group not found',
          },
        })
      }
      return response.internalServerError({
        meta: {
          status: 500,
          message: 'Internal server error',
        },
      })
    }
  }
}
