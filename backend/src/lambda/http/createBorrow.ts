import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateBorrowRequest } from '../../requests/CreateBorrowRequest'
import { getUserId } from '../utils'
import { createBorrow } from '../../helpers/borrows'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createBorrow')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newBorrow: CreateBorrowRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    if (newBorrow.name){
      const newItem = await createBorrow(userId, newBorrow)
      logger.info('Processing createBorrow event', { event })

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          item: newItem
        })
      }
    }
    else 
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: "Borrow must contain a name, at least."
        })
      }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
