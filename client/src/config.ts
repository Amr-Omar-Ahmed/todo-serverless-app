// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'i6e4xvtfyl'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-t2ycyt38.us.auth0.com', // Auth0 domain
  clientId: 'E5A6vKN90kyldrAlvIlSmkJl8zXhVaN1', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
