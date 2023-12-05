/*
|--------------------------------------------------------------------------
| Application middleware
|--------------------------------------------------------------------------
|
| This file is used to define middleware for HTTP requests. You can register
| middleware as a `closure` or an IoC container binding. The bindings are
| preferred, since they keep this file clean.
|
*/

import Server from '@ioc:Adonis/Core/Server'

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| An array of global middleware, that will be executed in the order they
| are defined for every HTTP requests.
|
*/
Server.middleware.register([() => import('@ioc:Adonis/Core/BodyParser')])

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key-value pair. The value is the namespace
| or middleware function and key is the alias. Later you can use these
| alias on individual routes. For example:
|
| { auth: () => import('App/Middleware/Auth') }
|
| and then use it as follows
|
| Route.get('dashboard', 'UserController.dashboard').middleware('auth')
|
*/
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth'),
  avatarChecker: () => import('App/Middleware/AvatarChecker'),
  friendRequestChecker: () => import('App/Middleware/FriendRequestChecker'),
  friendSentChecker: () => import('App/Middleware/FriendSentChecker'),
  friendChecker: () => import('App/Middleware/FriendChecker'),
  groupChecker: () => import('App/Middleware/GroupChecker'),
  groupRoleChecker: () => import('App/Middleware/GroupRoleChecker'),
  groupPrivateChecker: () => import('App/Middleware/GroupPrivateChecker'),
  groupJoinChecker: () => import('App/Middleware/GroupJoinChecker'),
  groupAdminChecker: () => import('App/Middleware/GroupAdminChecker'),
  messageChecker: () => import('App/Middleware/MessageChecker'),
})
