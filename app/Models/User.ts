import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  BaseModel,
  HasMany,
  HasOne,
  ManyToMany,
  afterFetch,
  afterFind,
  beforeSave,
  column,
  hasMany,
  hasOne,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import FriendRequest from './FriendRequest'
import GroupMember from './GroupMember'
import GroupRole from './GroupRole'
import Env from '@ioc:Adonis/Core/Env'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public username: string

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public status: string | null

  @column()
  public aboutMe: string | null

  @column()
  public avatar: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'friends',
    pivotForeignKey: 'user_id',
    localKey: 'id',
    pivotRelatedForeignKey: 'friend_id',
    pivotColumns: ['id'],
  })
  public friends: ManyToMany<typeof User>

  @hasMany(() => FriendRequest, {
    foreignKey: 'receiver_id',
  })
  public friendRequests: HasMany<typeof FriendRequest>

  @hasMany(() => FriendRequest, {
    foreignKey: 'sender_id',
  })
  public sentRequest: HasMany<typeof FriendRequest>

  @hasMany(() => GroupMember, {
    foreignKey: 'member_id',
  })
  public groupList: HasMany<typeof GroupMember>

  @hasOne(() => GroupRole, {
    foreignKey: 'member_id',
  })
  public groupRole: HasOne<typeof GroupRole>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @afterFetch()
  public static async afterFetchHook(users: User[]) {
    users.forEach((user) => {
      if (user.avatar) {
        user.avatar = `${Env.get('APP_URL')}/uploads/user-avatar/${user.avatar}`
      }
    })
  }

  @afterFind()
  public static async afterFindHook(user: User) {
    if (user.avatar) {
      user.avatar = `${Env.get('APP_URL')}/uploads/user-avatar/${user.avatar}`
    }
  }
}
