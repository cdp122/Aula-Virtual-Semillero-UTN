import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

const customFetch = (uri, options) => {
  const token = localStorage.getItem('semilleros_utn_token');
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return fetch(uri, options);
};

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch: customFetch
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
    query: { fetchPolicy: 'network-only' },
  },
});

export default apolloClient;

