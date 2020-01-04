import { createUser } from './createUser';
import axios from 'axios';
import { CoreFunction } from '../lib/Core';
import { pick } from 'lodash';
import { User } from '../types';
import { Context } from '../context';
import Store from '../Store';
import { createUserAccessToken } from '../tokens';
import uuid = require('uuid');

export interface Input {
  code: string;
}

export interface Output {
  user: User;
  accessToken: string;
}

export const loginWithGoogle: CoreFunction<Context, Input, Output> = async (
  ctx,
  input
) => {
  const { code } = input;

  //get an access token from google
  const accessToken = await getAccessTokenFromCode(code);
  //use that access token to get the users email
  const email = await getUserEmail(accessToken);

  //let's see if this user exists
  let { user } = await Store.getUserByEmail(ctx, { email });

  //if they don't we'll need to create them
  if (!user) {
    //Consider - password should probably be optional, but this works for now
    //it also allows them to eventually use this account without google after
    //going through reset password flow, so maybe it isn't the worst thing
    user = (await createUser(ctx, { email, password: uuid.v4() })).user;
  }

  return {
    user,
    accessToken: createUserAccessToken(pick(user, 'id', 'email')),
  };
};

async function getAccessTokenFromCode(code: string) {
  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,

      //FIXME: redirect URI should not be hardcoded
      //if you can get this off of "code", do that
      //if not, then the client needs to pass it when it calls this service function
      redirect_uri: `${process.env.FRONTEND_URL}/oauth/google`,
      grant_type: 'authorization_code',
      code,
    },
  });
  return data.access_token;
}

async function getUserEmail(access_token: string): Promise<string> {
  const { data } = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!data.email) {
    throw new Error('email not on info from google');
  }

  return data.email;
}
