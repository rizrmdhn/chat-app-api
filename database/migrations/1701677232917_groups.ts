import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'groups'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name').notNullable()
      table.string('description').nullable()
      table.string('group_image').nullable()
      table.string('is_private').defaultTo(false)
      table.string('invite_link').notNullable().unique()
      table.string('created_by').unsigned().references('id').inTable('users')
      table.string('updated_by').unsigned().references('id').inTable('users')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // indexing
      table.index(['id'], 'groups_id_index')
      table.index(['name'], 'groups_name_index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
