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

Route.get('/', 'DefaultsController.index')

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

  // Avatar and Group Image
  Route.post('/users/me/avatar', 'AvatarsController.store').middleware('avatarChecker')
  Route.post('/groups/:id/group-image', 'GroupImagesController.store').middleware([
    'groupRoleChecker',
    'groupImageChecker',
  ])

  // Friends
  Route.get('/friends', 'FriendsController.index')
  Route.post('/friends/:id', 'FriendsController.store').middleware([
    'friendRequestChecker',
    'friendSentChecker',
  ])
  Route.post('/friends/:id/accept', 'FriendsController.accept')
  Route.post('/friends/:id/reject', 'FriendsController.reject')
  Route.post('/friends/:id/cancel', 'FriendsController.cancel')
  Route.delete('/friends/:id', 'FriendsController.destroy')

  // Groups
  Route.get('/groups', 'GroupsController.index')
  Route.post('/groups', 'GroupsController.store')
  Route.get('/groups/:id', 'GroupsController.show')
  Route.put('/groups/:id', 'GroupsController.update').middleware([
    'groupChecker',
    'groupRoleChecker',
  ])
  Route.post('/groups/:id/leave', 'GroupsController.leave').middleware('groupChecker')
  Route.post('/group-link/:link/join', 'GroupsController.joinByLink').middleware('groupJoinChecker')
  Route.delete('/groups/:id', 'GroupsController.destroy').middleware(['groupAdminChecker'])

  // message friends
  Route.post('/message-friends/:id', 'MessageFriendsController.store').middleware([
    'messageChecker',
  ])
  Route.put('/message-friends/:id/:messageId', 'MessageFriendsController.update')
  Route.delete('/message-friends/:id/:messageId/soft-delete', 'MessageFriendsController.softDelete')
  Route.post('/message-friends/:id/:messageId/restore', 'MessageFriendsController.restore')
  Route.delete('/message-friends/:id/:messageId', 'MessageFriendsController.destroy')

  // message groups
  Route.post('/message-groups/:id', 'MessageGroupsController.store').middleware([
    'groupMessageChecker',
  ])
  Route.put('/message-groups/:id/:messageId', 'MessageGroupsController.update')
  Route.delete('/message-groups/:id/:messageId/soft-delete', 'MessageGroupsController.softDelete')
  Route.post('/message-groups/:id/:messageId/restore', 'MessageGroupsController.restore')
  Route.delete('/message-groups/:id/:messageId', 'MessageGroupsController.destroy')

  // get friends messages
  Route.get('/message-friends/:id', 'MessageFriendsController.index')

  // get groups messages
  Route.get('/message-groups/:id', 'MessageGroupsController.index')
}).middleware('auth')
