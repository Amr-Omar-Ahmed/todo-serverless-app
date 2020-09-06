import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem, TodoUpdate } from '../models/todo'

const logger = createLogger('datalayer')
const XAWS = AWSXRay.captureAWS(AWS)
const docClient: DocumentClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
const userIdIndex = process.env.USER_ID_INDEX
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getAllTodes(userId: string): Promise<TodoItem[]> {
  const result = await docClient
    .query(
      {
        TableName: todosTable,
        IndexName: userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      },
      (err, data) => {
        err
          ? logger.info('Query failed', err)
          : logger.info('Query succeeded', data)
      }
    )
    .promise()
  return result.Items as TodoItem[]
}

export async function createTodo(todo: TodoItem): Promise<TodoItem> {
  await docClient
    .put(
      {
        TableName: todosTable,
        Item: todo
      },
      (err, data) => {
        err
          ? logger.info('Insertion failed', err)
          : logger.info('Insertion succeeded', data)
      }
    )
    .promise()

  return todo
}

export async function deleteTodo(todoId: string, userId: string) {
  await docClient
    .delete(
      {
        TableName: todosTable,
        Key: { userId, todoId }
      },
      (err, data) => {
        err
          ? logger.info('Deletion failed', err)
          : logger.info('Deleteion succeeded', data)
      }
    )
    .promise()
  return {}
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updatedTodo: TodoUpdate
) {
  await docClient
    .update(
      {
        TableName: todosTable,
        Key: { userId, todoId },
        ExpressionAttributeNames: { '#N': 'name' },
        UpdateExpression: 'set #N=:todoName, dueDate=:dueDate, done=:done',
        ExpressionAttributeValues: {
          ':todoName': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        },
        ReturnValues: 'UPDATED_NEW'
      },
      (err, data) => {
        err
          ? logger.info('Update failed', err)
          : logger.info('Update succeeded', data)
      }
    )
    .promise()
  return {}
}

export async function generateUploadUrl(
  todoId: string,
  userId: string
): Promise<string> {
  const S3 = new XAWS.S3({ signatureVersion: 'v4' })
  const Bucket = process.env.S3_BUCKET_NAME
  const uploadUrl = S3.getSignedUrl('putObject', {
    Bucket,
    Key: todoId,
    Expires: urlExpiration
  })
  await docClient
    .update(
      {
        TableName: todosTable,
        Key: { userId, todoId },
        UpdateExpression: 'set attachmentUrl=:URL',
        ExpressionAttributeValues: {
          ':URL': uploadUrl.split('?')[0]
        },
        ReturnValues: 'UPDATED_NEW'
      },
      (err, data) => {
        err
          ? logger.info('Update URL failed', err)
          : logger.info('GenerateURL and Update attachement URL', data)
      }
    )
    .promise()

  return uploadUrl
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
