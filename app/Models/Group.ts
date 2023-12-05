import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import GroupMember from './GroupMember'
import GroupRole from './GroupRole'

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
