/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

// Auth
Route.post('/login', 'AuthController.login')
Route.post('/register', 'UsersController.store')

Route.group(() => {
  Route.post('/logout', 'AuthController.logout')

  // Users
  Route.get('/users/me', 'UsersController.show')
  Route.put('/users/me/name', 'UsersController.updateName')
  Route.put('/users/me/about-me', 'UsersController.updateAboutMe')
  Route.put('/users/me/status', 'UsersController.updateStatus')

  // Avatar
  Route.post('/users/me/avatar', 'AvatarsController.store').middleware('avatarChecker')
}).middleware('auth')
