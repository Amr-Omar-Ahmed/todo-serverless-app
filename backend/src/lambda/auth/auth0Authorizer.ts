import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../models/jwt'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJPAa/i3H33IYPMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi10MnljeXQzOC51cy5hdXRoMC5jb20wHhcNMjAwOTA1MjE0NDMzWhcN
MzQwNTE1MjE0NDMzWjAkMSIwIAYDVQQDExlkZXYtdDJ5Y3l0MzgudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAntq0QTEWZ1WLlAby
efnFhCeYMLfiH9c6c6FTboX2ObV2hI6sELJtKvcsWg+YBOk2nUp1gNi9U6BxellL
b46U8edP7F6FsmRmx9RyDLA+aSI4c1BA4XM081TqQPFiEXfqIaqw1G5PMMFiv3yy
3mi3ZHvorrAGibAxG+U/U+VmqbxVMZu1p9ja7fs6UHoEP09xonUe5J7SmE3ZYGiW
nYrqNoTZoNS23dpBqbqdijpi5tAiAOlv6yF+CIu6YQ1graxkFaPQYCrLaC3SQIeI
xUMfAKLrmA56pOyHHUgWoDgAw/XjV1HFp9n4nOZ2ynXfKoBLLJWlH3++PlRYGyce
Vb3whwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS2mBTVUXGT
sEC1zbrQc7oTOHjNBTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AANjQkWrfUZXgY8wqYXskm+ragNJcDBseN96JnzYJCMv9/oD2dSwdMcohcZ9fEv4
STktANin8302n5mzSAFMBRgp9DABcBtsaev+MT1Y3/316aiVKALu0Iig+hYDlea2
Jgfz3DZA959lm4cHb+/VeYMADiU491HZHXNtUNiY1YM8/9uhsHXUGUmSbHztSCKG
MoXjO4LEsl+duAhWjHHgYCEgV3bTxAQ+1gdMVPH70r9i88cyuAz1pIhiwajy6okW
W9up6baTnjPvEoadZFzYreXy42o/tjkXLf9Acrh3dRZi3gC16Bp8L/q+gVJraT5G
r+g6dHTXP46iUdO3WykQ3Bg=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  if (split[0].toLowerCase() !== 'bearer')
    throw new Error('Invalid authentication header')

  return token
}
