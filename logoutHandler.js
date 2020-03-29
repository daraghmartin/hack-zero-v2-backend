import AWS from "aws-sdk";
import util from "util";
const { promisify } = util;

AWS.config.update({
  accessKeyId: process.env.AWS_ACC_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET
});
const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-19",
  region: "us-east-1"
});
const utilPromiseAdminLogout = promisify(
  COGNITO_CLIENT.adminUserGlobalSignOut
).bind(COGNITO_CLIENT);

export const logout = async (event, context) => {
  const data = JSON.parse(event.body);
  //console.log(data);
  const { email } = data;
  const userParams = {
    UserPoolId: process.env.AWS_USER_POOL_ID /* required */,
    Username: email
  };
  try {
    let result = await utilPromiseAdminLogout(userParams);
    console.log(result);
    return {
      statusCode: 200,
      body: "logge out"
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: "unable to logout"
    };
  }
};
