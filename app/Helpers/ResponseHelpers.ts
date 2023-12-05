export default class ResponseHelpers {
  public validationErrorRepsonse({ error }) {
    return {
      meta: {
        status: 400,
        message: 'Validation error',
      },
      data: error.messages,
    }
  }

  public badRequestResponse(message: string) {
    return {
      meta: {
        status: 400,
        message: message,
      },
    }
  }

  public forbiddenResponse(message: string) {
    return {
      meta: {
        status: 403,
        message: message,
      },
    }
  }

  public successResponse(data: any) {
    return {
      meta: {
        status: 200,
        message: 'Success',
      },
      data: data,
    }
  }

  public notFoundResponse(message: string) {
    return {
      meta: {
        status: 404,
        message: message,
      },
    }
  }

  public unauthorizedResponse(message: string) {
    return {
      meta: {
        status: 401,
        message: message,
      },
    }
  }

  public internalServerErrorResponse(message: string) {
    return {
      meta: {
        status: 500,
        message: message,
      },
    }
  }
}
