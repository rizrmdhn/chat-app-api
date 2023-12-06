import { DateTime } from 'luxon'
import { BaseModel, HasMany, afterFetch, afterFind, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import GroupMember from './GroupMember'
import GroupRole from './GroupRole'
import GroupMessage from './GroupMessage'
import Env from '@ioc:Adonis/Core/Env'
export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public groupImage: string

  @column()
  public isPrivate: boolean

  @column()
  public inviteLink: string

  @column()
  public createdBy: string

  @column()
  public updatedBy: string

  @hasMany(() => GroupMember, {
    foreignKey: 'groupId',
  })
  public groupMembers: HasMany<typeof GroupMember>

  @hasMany(() => GroupRole, {
    foreignKey: 'groupId',
  })
  public groupRoles: HasMany<typeof GroupRole>

  @hasMany(() => GroupMessage, {
    foreignKey: 'groupId',
  })
  public groupMessages: HasMany<typeof GroupMessage>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterFetch()
  public static async afterFetchHook(groups: Group[]) {
    groups.forEach((group) => {
      if (group.groupImage) {
        group.groupImage = `${Env.get('APP_URL')}/group-image/${group.groupImage}`
      }
    })
  }

  @afterFind()
  public static async afterFindHook(group: Group) {
    if (group.groupImage) {
      group.groupImage = `${Env.get('APP_URL')}/group-image/${group.groupImage}`
    }
  }
}
