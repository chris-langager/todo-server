import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type CreateUserInput = {
  email: Scalars['String'],
  password: Scalars['String'],
};

export type CreateUserOutput = {
   __typename?: 'CreateUserOutput',
  user: User,
};

export type LoginUserInput = {
  email: Scalars['String'],
  password: Scalars['String'],
};

export type LoginUserOutput = {
   __typename?: 'LoginUserOutput',
  user: User,
  accessToken: Scalars['String'],
};

export type LoginWithGoogleInput = {
  /** code is what you get back from the querystring when google redirects back to our app */
  code: Scalars['String'],
};

export type LoginWithGoogleOutput = {
   __typename?: 'LoginWithGoogleOutput',
  user: User,
  accessToken: Scalars['String'],
};

export type Mutation = {
   __typename?: 'Mutation',
  createUser: CreateUserOutput,
  loginUser: LoginUserOutput,
  loginWithGoogle: LoginWithGoogleOutput,
  upsertTodos: UpsertTodosOutput,
};


export type MutationCreateUserArgs = {
  input: CreateUserInput
};


export type MutationLoginUserArgs = {
  input: LoginUserInput
};


export type MutationLoginWithGoogleArgs = {
  input: LoginWithGoogleInput
};


export type MutationUpsertTodosArgs = {
  input: UpsertTodosInput
};

export type Query = {
   __typename?: 'Query',
  todos: Array<Todo>,
  test?: Maybe<Test>,
};

export type Test = {
   __typename?: 'Test',
  a?: Maybe<Scalars['String']>,
  b?: Maybe<Scalars['String']>,
};

export type Todo = {
   __typename?: 'Todo',
  id: Scalars['ID'],
  text: Scalars['String'],
  completed: Scalars['Boolean'],
  history: Array<Scalars['String']>,
};

export type UpsertTodoInput = {
  id?: Maybe<Scalars['String']>,
  text: Scalars['String'],
  completed: Scalars['Boolean'],
};

export type UpsertTodosInput = {
  upsertTodoInputs: Array<UpsertTodoInput>,
};

export type UpsertTodosOutput = {
   __typename?: 'UpsertTodosOutput',
  _?: Maybe<Scalars['Boolean']>,
};

export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  email: Scalars['String'],
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  Todo: ResolverTypeWrapper<Todo>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  Test: ResolverTypeWrapper<Test>,
  Mutation: ResolverTypeWrapper<{}>,
  CreateUserInput: CreateUserInput,
  CreateUserOutput: ResolverTypeWrapper<CreateUserOutput>,
  User: ResolverTypeWrapper<User>,
  LoginUserInput: LoginUserInput,
  LoginUserOutput: ResolverTypeWrapper<LoginUserOutput>,
  LoginWithGoogleInput: LoginWithGoogleInput,
  LoginWithGoogleOutput: ResolverTypeWrapper<LoginWithGoogleOutput>,
  UpsertTodosInput: UpsertTodosInput,
  UpsertTodoInput: UpsertTodoInput,
  UpsertTodosOutput: ResolverTypeWrapper<UpsertTodosOutput>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  Todo: Todo,
  ID: Scalars['ID'],
  String: Scalars['String'],
  Boolean: Scalars['Boolean'],
  Test: Test,
  Mutation: {},
  CreateUserInput: CreateUserInput,
  CreateUserOutput: CreateUserOutput,
  User: User,
  LoginUserInput: LoginUserInput,
  LoginUserOutput: LoginUserOutput,
  LoginWithGoogleInput: LoginWithGoogleInput,
  LoginWithGoogleOutput: LoginWithGoogleOutput,
  UpsertTodosInput: UpsertTodosInput,
  UpsertTodoInput: UpsertTodoInput,
  UpsertTodosOutput: UpsertTodosOutput,
};

export type CreateUserOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserOutput'] = ResolversParentTypes['CreateUserOutput']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
};

export type LoginUserOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['LoginUserOutput'] = ResolversParentTypes['LoginUserOutput']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type LoginWithGoogleOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['LoginWithGoogleOutput'] = ResolversParentTypes['LoginWithGoogleOutput']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createUser?: Resolver<ResolversTypes['CreateUserOutput'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>,
  loginUser?: Resolver<ResolversTypes['LoginUserOutput'], ParentType, ContextType, RequireFields<MutationLoginUserArgs, 'input'>>,
  loginWithGoogle?: Resolver<ResolversTypes['LoginWithGoogleOutput'], ParentType, ContextType, RequireFields<MutationLoginWithGoogleArgs, 'input'>>,
  upsertTodos?: Resolver<ResolversTypes['UpsertTodosOutput'], ParentType, ContextType, RequireFields<MutationUpsertTodosArgs, 'input'>>,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  todos?: Resolver<Array<ResolversTypes['Todo']>, ParentType, ContextType>,
  test?: Resolver<Maybe<ResolversTypes['Test']>, ParentType, ContextType>,
};

export type TestResolvers<ContextType = any, ParentType extends ResolversParentTypes['Test'] = ResolversParentTypes['Test']> = {
  a?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  b?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type TodoResolvers<ContextType = any, ParentType extends ResolversParentTypes['Todo'] = ResolversParentTypes['Todo']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  history?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
};

export type UpsertTodosOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpsertTodosOutput'] = ResolversParentTypes['UpsertTodosOutput']> = {
  _?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type Resolvers<ContextType = any> = {
  CreateUserOutput?: CreateUserOutputResolvers<ContextType>,
  LoginUserOutput?: LoginUserOutputResolvers<ContextType>,
  LoginWithGoogleOutput?: LoginWithGoogleOutputResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Test?: TestResolvers<ContextType>,
  Todo?: TodoResolvers<ContextType>,
  UpsertTodosOutput?: UpsertTodosOutputResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
