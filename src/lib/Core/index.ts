export type CoreFunction<
  Context,
  Input extends object = {},
  Output extends object = {}
> = (ctx: Context, input: Input) => Promise<Output>;

export type Core<Context> = { [K: string]: CoreFunction<Context> };

export interface Metadata {
  coreFunctionName: string;
}

export type WrapperFunction<Context> = (
  ctx: Context,
  input: any,
  next: (ctx: Context, input: any) => Promise<any>,
  metadata: Metadata
) => Promise<any>;

//wrap a set of core functions with a set of wrapperFunctions
//they will be executed in the same order that they are passed in
export function wrapWith<Context, C extends Core<Context>>(
  core: C,
  ...wrapperFunctions: WrapperFunction<Context>[]
): C {
  return wrapperFunctions.reverse().reduce((acc, wrapperFunction) => {
    return _wrapWith(acc, wrapperFunction);
  }, core);
}

function _wrapWith<Context, C extends Core<Context>>(
  core: C,
  wrapperFunction: WrapperFunction<Context>
): C {
  const ret = Object.keys(core).reduce<C>(
    (acc, coreFunctionName) => {
      //@ts-ignore - reduce typings are frustrating
      acc[coreFunctionName] = async (ctx: Context, input: any) => {
        //ADD LATER: this is where we could do stuff like not apply middleware based on a whitelist
        return wrapperFunction(ctx, input, core[coreFunctionName], { coreFunctionName });
      };
      return acc;
    },
    { ...core }
  );

  return ret;
}
