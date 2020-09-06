import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { updateTodo } from '../../BL'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  try {
    console.log('updateTodo TO-DO event', event)
    await updateTodo(event)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    }
  } catch (error) {
    console.error('updateTodo TO-DO event', error.message)

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'invalid request'
      })
    }
  }
}
