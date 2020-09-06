import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { generateUploadUrl } from '../../BL'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  try {
    console.log('generateUploadUrl TO-DO event', event)
    const uploadUrl = await generateUploadUrl(event)
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        uploadUrl
      })
    }
  } catch (error) {
    console.error('generateUploadUrl TO-DO event', error.message)

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'invalid request'
      })
    }
  }
}
