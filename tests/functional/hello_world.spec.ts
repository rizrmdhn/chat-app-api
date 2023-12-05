import { test } from '@japa/runner'

test('display welcome page', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertBodyContains({
    meta: {
      status: 200,
      message: 'Welcome to Chat App API',
    },
    data: {
      name: 'Chat App API',
      version: '1.0.0',
    },
  })
})
