import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Login', (group) => {
  const testUser = {
    id: 'test-1',
    name: 'test',
    username: 'test',
    email: 'test@mail.com',
    password: '123456789',
  }
  group.setup(async () => {
    await User.create({
      id: testUser.id,
      name: testUser.name,
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
    })
  })

  group.teardown(async () => {
    await User.query().delete()
  })
  // Write your test here
  test('should return error if username is missing', async ({ client }) => {
    const response = await client.post('/login').fields({
      password: testUser.password,
    })

    response.assertStatus(400)
    response.assertBodyContains({
      meta: {
        status: 400,
        message: 'Validation error',
      },
    })
  })

  test('should return error if password is missing', async ({ client }) => {
    const response = await client.post('/login').fields({
      username: testUser.username,
    })

    response.assertStatus(400)
    response.assertBodyContains({
      meta: {
        status: 400,
        message: 'Validation error',
      },
    })
  })

  test('should login correctly', async ({ client }) => {
    const response = await client.post('/login').fields({
      username: testUser.username,
      password: testUser.password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  })
})
