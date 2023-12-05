import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Group from './Group'
import GroupRole from './GroupRole'

export default class GroupMember extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public groupId: string

  @column()
  public memberId: string

  @hasOne(() => Group, {
    foreignKey: 'id',
    localKey: 'groupId',
  })
  public group: HasOne<typeof Group>

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'memberId',
  })
  public user: HasOne<typeof User>

  @hasOne(() => GroupRole, {
    localKey: 'memberId',
    foreignKey: 'memberId',
  })
  public userRole: HasOne<typeof GroupRole>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
