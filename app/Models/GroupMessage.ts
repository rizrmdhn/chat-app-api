import { DateTime } from 'luxon'
import { BaseModel, HasOne, afterFetch, afterFind, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Group from './Group'

export default class GroupMessage extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public groupId: string

  @column()
  public senderId: string

  @column()
  public readBy: object | null

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

  @hasOne(() => Group, {
    foreignKey: 'id',
    localKey: 'groupId',
  })
  public group: HasOne<typeof Group>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @afterFetch()
  public static async afterFetchHook(messages: GroupMessage[]) {
    messages.forEach((message) => {
      if (message.$dirty.readBy) {
        if (message.readBy !== null) {
          message.readBy = JSON.parse(message.readBy.toString())
        }
      }
    })
  }

  @afterFind()
  public static async afterFindHook(message: GroupMessage) {
    if (message.$dirty.readBy) {
      if (message.readBy !== null) {
        message.readBy = JSON.parse(message.readBy.toString())
      }
    }
  }
}
