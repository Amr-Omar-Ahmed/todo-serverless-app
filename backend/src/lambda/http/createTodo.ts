import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { createTodo } from '../../BL'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }
  try {
    console.log('Create TO-DO event', event)
    const toDoItem = await createTodo(event)
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        item: toDoItem
      })
    }
  } catch (error) {
    console.error('Create TO-DO event', error.message)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'invalid request'
      })
    }
  }
}
