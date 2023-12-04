import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'friends'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('friend_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // indexing
      table.index(['id'], 'friends_id_index')
      table.index(['user_id'], 'friends_user_id_index')
      table.index(['friend_id'], 'friends_friend_id_index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
