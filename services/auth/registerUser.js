import AWS from "aws-sdk";
import util from "util";
import User from "../database/models/UserModel";
import { connectToDatabase } from "../database/db";

AWS.config.update({
  accessKeyId: process.env.AWS_ACC_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET
});
const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-19",
  region: "us-east-1"
});

const utilPromiseRegisterUser = util
  .promisify(COGNITO_CLIENT.adminCreateUser)
  .bind(COGNITO_CLIENT);

const utilPromiseSetPassword = util
  .promisify(COGNITO_CLIENT.adminSetUserPassword)
  .bind(COGNITO_CLIENT);

export const register = async (event, context) => {
  // console.log(event.body);
  const data = JSON.parse(event.body);
  const { email, password, name } = data;
  // let awsUserName = "";

  const createUserParams = {
    UserPoolId: process.env.AWS_USER_POOL_ID,
    Username: email,
    DesiredDeliveryMediums: ["EMAIL"],
    ForceAliasCreation: false,
    TemporaryPassword: password,
    UserAttributes: [{ Name: "email", Value: email }]
  };
  const passwordParams = {
    Password: password /* required */,
    UserPoolId: process.env.AWS_USER_POOL_ID /* required */,
    Username: email /* required */,
    Permanent: true
  };

  try {
    await utilPromiseRegisterUser(createUserParams);
    await utilPromiseSetPassword(passwordParams);
    await connectToDatabase();
    const newUser = new User({ email, name });
    await newUser.save();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
        "Access-Control-Allow-Credentials": true
      },
      body: "User created"
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
        "Access-Control-Allow-Credentials": true
      },
      body: err.message
    };
  }
};
