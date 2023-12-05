import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Group from './Group'
import User from './User'

export default class GroupRole extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public groupId: string

  @column()
  public roleId: string

  @column()
  public memberId: string

  @hasOne(() => Group, {
    foreignKey: 'id',
    localKey: 'groupId',
  })
  public group: HasOne<typeof Group>

  @hasOne(() => Role, {
    foreignKey: 'id',
    localKey: 'roleId',
  })
  public role: HasOne<typeof Role>

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'memberId',
  })
  public member: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
