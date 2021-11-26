import { BorrowItem } from '../models/BorrowItem'
import { CreateBorrowRequest } from '../requests/CreateBorrowRequest'
import { UpdateBorrowRequest } from '../requests/UpdateBorrowRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk';

// import * as createError from 'http-errors'

// BORROW: Implement businessLogic
const logger = createLogger('borrows')
const docClient = new AWS.DynamoDB.DocumentClient()
const borrows = process.env.BORROWS_TABLE
const s3 = new AWS.S3({signatureVersion: 'v4'})
const bucketName = process.env.ATTACHMENTS_S3_BUCKET

export async function getBorrowsForUser(userId: string): Promise<BorrowItem[]> {
  logger.info(`Retrieving all borrows for user ${userId}`, { userId })

    const result = await docClient
      .query({
        TableName: borrows,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    logger.info(
      `Found ${items.length} borrows for user ${userId} in ${borrows}`
    )

    return items as BorrowItem[]
    
  }

  export async function createBorrow(userId: string, createBorrowRequest: CreateBorrowRequest): Promise<BorrowItem> {
    const borrowId = uuid.v4()

    const newBorrow: BorrowItem = {
      userId,
      borrowId,
      createdAt: new Date().toISOString(),
      returned: false,
      remind: false,
      attachmentUrl: null,
      ...createBorrowRequest
    }

    logger.info(`Create a borrow ${borrowId} for user ${userId}`, { userId, borrowId, borrowItem: newBorrow })
  
    await docClient
      .put({
        TableName: borrows,
        Item: newBorrow
      })
      .promise()
  
    return newBorrow
  }
  
  export async function updateBorrow(userId: string, borrowId: string, updateBorrowRequest: UpdateBorrowRequest) {
    logger.info(`Updating borrow ${borrowId} for user ${userId}`, { userId, borrowId, borrowUpdate: updateBorrowRequest })

    await docClient
      .update({
        TableName: borrows,
        Key: {
            userId: userId,
            borrowId: borrowId
        },
        UpdateExpression: 'set #name = :name, borrowDate = :borrowDate, returned = :returned, remind = :remind',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': updateBorrowRequest.name,
          ':borrowDate': updateBorrowRequest.borrowDate,
          ':returned': updateBorrowRequest.returned,
          ':remind': updateBorrowRequest.remind
        }
      })
      .promise()
  }
  
  export async function deleteBorrow(userId: string, borrowId: string) {
    logger.info(`Deleting borrow ${borrowId} for user ${userId}`, { userId, borrowId })
  
    await docClient.delete({
        TableName: borrows,
        Key: {
            userId: userId,
            borrowId: borrowId
        }
    }).promise()
  }
  
  export async function putAttachment(userId: string, borrowId: string) {
    await docClient.update({
        TableName: borrows,
        Key: {
            userId: userId,
            borrowId: borrowId
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${borrowId}`
        }
    }).promise()
}

export function getSignedURL(expiry: string, borrowId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: borrowId,
        Expires: parseInt(expiry)
    })
}
  
