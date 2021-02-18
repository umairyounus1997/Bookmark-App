import { ApolloClient, InMemoryCache } from '@apollo/client';
 
export const client = new ApolloClient({
    uri: '/.netlify/functions/bookmarks',
    cache: new InMemoryCache()

});

 