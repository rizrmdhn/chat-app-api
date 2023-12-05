import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'group_members'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('group_id').unsigned().references('id').inTable('groups').onDelete('CASCADE')
      table.string('member_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // indexing
      table.index(['id'], 'group_members_id_index')
      table.index(['group_id'], 'group_members_group_id_index')
      table.index(['member_id'], 'group_members_member_id_index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
