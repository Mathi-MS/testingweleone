import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

let store: any = null;
let refreshTokenThunk: any = null;
let logoutAction: any = null;

export const injectStore = (
  _store: any,
  _refreshTokenThunk: any,
  _logoutAction: any
) => {
  store = _store;
  refreshTokenThunk = _refreshTokenThunk;
  logoutAction = _logoutAction;
};

const authLink = setContext((_, { headers }) => {
  // Get token from Redux state instead of sessionStorage
  const token = store?.getState()?.ar?.accessToken;
  const userId = store?.getState()?.ar?.userDetails?.id;
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
      ...(userId && { "x-user-id": userId }),
    },
  };
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const errorLink = onError(
  ({ graphQLErrors, operation, forward }: any) => {
    // Skip error handling for auth operations to prevent loops
    if (
      ["RefreshToken", "GetToken", "LoginWithGoogle", "VerifyLoginOtp"].includes(
        operation.operationName
      )
    ) {
      return;
    }

    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (
          err.extensions?.code === "UNAUTHENTICATED" ||
          err.message.includes("Unauthorized") ||
          err.message.includes("Context creation failed: Your session expired")
        ) {
          if (!isRefreshing) {
            isRefreshing = true;

            store
              .dispatch(refreshTokenThunk())
              .then((action: any) => {
                if (action.type.endsWith("fulfilled")) {
                  const newToken = action.payload.accessToken;
                  pendingRequests.forEach((callback) => callback(newToken));
                  pendingRequests = [];
                } else {
                  // Failure: Logout
                  pendingRequests = [];
                  if (logoutAction) store.dispatch(logoutAction());
                }
              })
              .catch(() => {
                pendingRequests = [];
                if (logoutAction) store.dispatch(logoutAction());
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
        }
        return new Observable((observer) => {
          pendingRequests.push((newToken) => {
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                Authorization: `Bearer ${newToken}`,
              },
            });

            // Retry the request
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            };
            forward(operation).subscribe(subscriber);
          });
        });
      }
    }
  }
);

const createAuthedClient = (uri: string): any => {
  const httpLink = createHttpLink({ uri });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getAllBatch: {
              keyArgs: ['isMasterClass'],
              merge(existing, incoming) {
                return incoming;
              },
            },
            getBatchById: {
              read(existing, { args, toReference }) {
                return existing || toReference({ __typename: 'Batch', id: args?.id });
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  });
};

/* ======================================================
   API Base URLs
   ====================================================== */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL;

/* ======================================================
   Apollo Clients
   ====================================================== */

// Micro Learning
export const mlClient = createAuthedClient(
  `${import.meta.env.VITE_API_BASE_URL}/course/graphql`
);
export const batchClient = createAuthedClient(
 `${import.meta.env.VITE_API_BASE_URL}/batch/graphql`
);
// https://thrasonical-karisa-dyarchical.ngrok-free.dev/api/batch/graphql`
export const batchrestClient = createAuthedClient(
  `${import.meta.env.VITE_API_BASE_URL}/batch/import-learner`
);  
// Categoriess
export const categoriesClient = createAuthedClient(
  `${import.meta.env.VITE_CATEGORIES_ENDPOINT}`
);

// User
export const userClient = createAuthedClient(
  `${import.meta.env.VITE_USER_ENDPOINT}/graphql`
);

// Master
export const masterClient = createAuthedClient(
  `${API_BASE_URL}/master/graphql`
);

// Community
export const communityClient = createAuthedClient(
  `${API_BASE_URL}/chat/graphql`
);

// Session Comments (using chat service)
export const sessionClient = communityClient;

/* ======================================================
   Auth Client (for public endpoints like login)
   ====================================================== */

export const authClient = createAuthedClient(
  `https://8dcd-103-186-120-55.ngrok-free.app/graphql`
);


