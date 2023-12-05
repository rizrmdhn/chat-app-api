import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Logout', (group) => {
  let LoginToken: string = ''
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
  test('should return error if token is missing', async ({ client }) => {
    const response = await client.post('/logout')

    response.assertStatus(401)
    response.assertBodyContains({
      meta: {
        status: 401,
        message: 'Unauthorized access please login',
      },
    })
  })

  test('should logout correctly', async ({ client }) => {
    const loginResponse = await client.post('/login').fields({
      username: testUser.username,
      password: testUser.password,
    })

    LoginToken = loginResponse.body().data.token

    const response = await client.post('/logout').header('Authorization', `Bearer ${LoginToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      meta: {
        status: 200,
        message: 'Success',
      },
    })
  })
})
