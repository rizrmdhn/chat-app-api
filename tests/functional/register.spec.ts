import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Register', (group) => {
  group.teardown(async () => {
    await User.query().delete()
  })
  // Write your test here
  test('should return error if name is missing', async ({ client }) => {
    const testUser = {
      username: 'test',
      email: 'test@mail.com',
      password: '123456789',
    }

    const response = await client.post('/register').fields(testUser)

    response.assertStatus(400)
    response.assertBodyContains({
      meta: {
        status: 400,
        message: 'Validation error',
      },
    })
  })

  test('should register a new user', async ({ client }) => {
    const testUser = {
      name: 'test',
      username: 'test',
      email: 'test@mail.com',
      password: '123456789',
    }
    const response = await client.post('/register').fields(testUser)

    response.assertStatus(201)
    response.assertBodyContains({
      meta: {
        status: 201,
        message: 'Success',
      },
      data: {
        name: testUser.name,
        username: testUser.username,
        email: testUser.email,
      },
    })
  })
})
