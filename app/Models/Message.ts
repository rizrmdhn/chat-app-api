import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public senderId: string

  @column()
  public receiverId: string

  @column()
  public message: string

  @column()
  public isRead: boolean

  @column()
  public isEdited: boolean

  @column()
  public isDeleted: boolean

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'senderId',
  })
  public sender: HasOne<typeof User>

  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'receiverId',
  })
  public receiver: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
