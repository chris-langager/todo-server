import { WrapperFunction } from '../../../lib/Core';
import { Context } from '../../../context';
import { validateUserAccessToken } from '../../../tokens';

const whiteList = ['createUser', 'loginUser', 'loginWithGoogle'];

export const authentication: WrapperFunction<Context> = (ctx, input, next, metadata) => {
  const { coreFunctionName } = metadata;
  if (whiteList.includes(coreFunctionName)) {
    return next(ctx, input);
  }

  const { token } = ctx;
  if (!token) {
    throw new Error('missing access token');
  }

  const claims = validateUserAccessToken(token);
  const newContext = {
    ...ctx,
    claims,
  };

  return next(newContext, input);
};
