import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
import * as nanoid from 'nanoid'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await Role.createMany([
      {
        id: `role-${nanoid.nanoid(16)}`,
        name: 'admin',
        description: 'A role for admin',
      },
      {
        id: `role-${nanoid.nanoid(16)}`,
        name: 'moderator',
        description: 'A role for moderator',
      },
      {
        id: `role-${nanoid.nanoid(16)}`,
        name: 'member',
        description: 'A role for member',
      },
    ])
  }
}
