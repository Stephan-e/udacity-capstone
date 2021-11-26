import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateBorrow } from '../../helpers/borrows'
import { UpdateBorrowRequest } from '../../requests/UpdateBorrowRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateBorrow')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing updateBorrow event', { event })

    const userId = getUserId(event)
    const borrowId = event.pathParameters.borrowId
    const updatedBorrow: UpdateBorrowRequest = JSON.parse(event.body)

    await updateBorrow(userId, borrowId, updatedBorrow)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
