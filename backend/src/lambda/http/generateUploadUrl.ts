import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getSignedURL, putAttachment } from '../../helpers/borrows'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'

const signedUrlExpiry = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('updateAttachment')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Uploading Image with generateUploadUrl event', { event })

    const borrowId = event.pathParameters.borrowId
    const userId = getUserId(event)

    const uploadUrl = getSignedURL(signedUrlExpiry, borrowId)
    await putAttachment(userId, borrowId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
