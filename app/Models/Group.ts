import { DateTime } from 'luxon'
import {
  BaseModel,
  HasMany,
  HasOne,
  afterFetch,
  afterFind,
  column,
  hasMany,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm'
import GroupMember from './GroupMember'
import GroupRole from './GroupRole'
import GroupMessage from './GroupMessage'
import Env from '@ioc:Adonis/Core/Env'
import User from './User'
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

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'createdBy',
  })
  public creator: HasOne<typeof User>

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'updatedBy',
  })
  public updater: HasOne<typeof User>

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
