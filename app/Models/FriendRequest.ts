import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class FriendRequest extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public sender_id: string

  @column()
  public receiver_id: string

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'sender_id',
  })
  public sender: HasOne<typeof User>

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'receiver_id',
  })
  public receiver: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
