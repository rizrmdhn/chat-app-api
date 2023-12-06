import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseHelpers from 'App/Helpers/ResponseHelpers'
import Group from 'App/Models/Group'
import fs from 'fs'

export default class GroupImageChecker {
  public async handle({ params, response }: HttpContextContract, next: () => Promise<void>) {
    // Helpers
    const responseHelpers = new ResponseHelpers()
    // code for middleware goes here. ABOVE THE NEXT CALL
    const groupId = params.id

    const group = await Group.query().select('group_image').where('id', groupId).firstOrFail()

    if (!group) {
      return response.notFound(responseHelpers.notFoundResponse('Group not found'))
    }

    const groupImage = group.groupImage?.split('/')[4]
    console.log(
      '🚀 ~ file: GroupImageChecker.ts:20 ~ GroupImageChecker ~ handle ~ groupImage:',
      groupImage
    )

    if (group.groupImage) {
      // Delete old group image
      fs.unlinkSync(`./tmp/uploads/group-image/${groupImage}`)
    }

    await next()
  }
}
