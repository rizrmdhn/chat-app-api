/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  // create exception handler for E_UNAUTHORIZED_ACCESS
  public async handle(error: { code: string }, ctx: HttpContextContract) {
    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.unauthorized({
        meta: {
          status: 401,
          message: 'Unauthorized access please login',
        },
      })
    }

    if (error.code === 'E_INVALID_AUTH_UID') {
      return ctx.response.notFound({
        meta: {
          status: 404,
          message: 'User not found',
        },
      })
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.notFound({
        meta: {
          status: 404,
          message: 'Route not found',
        },
      })
    }

    return super.handle(error, ctx)
  }
}
