import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('message').notNullable()
      table.boolean('is_read').defaultTo(false)
      table.boolean('is_edited').defaultTo(false)
      table.boolean('is_deleted').defaultTo(false)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true })

      // indexing
      table.index(['id'], 'messages_id_index')
      table.index(['sender_id'], 'messages_sender_id_index')
      table.index(['receiver_id'], 'messages_receiver_id_index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
