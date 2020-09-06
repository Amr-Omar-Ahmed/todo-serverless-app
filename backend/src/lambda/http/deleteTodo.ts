import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { deleteTodo } from '../../BL'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  try {
    console.log('delete TO-DO event', event)
    await deleteTodo(event)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    }
  } catch (error) {
    console.error('delete TO-DO event', error.message)

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'invalid request'
      })
    }
  }
}
