const { ApolloServer, gql } = require('apollo-server-lambda');
const faunadb = require('faunadb'),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]
  }
  type Bookmark {
    id: ID!
    url: String!
    desc: String!
  }
  type Mutation {
    addBookmark(url: String!, desc: String!) : Bookmark
  }
`

const authors = [
  { id: 1, url: 'https://github.com/gatsbyjs/gatsby-starter-hello-world', desc: "this is a gatsby project" },
  { id: 2, url: 'https://github.com/gatsbyjs/gatsby-starter-hello-world', desc: "this is a gatsby project" },
  { id: 3, url: 'https://github.com/gatsbyjs/gatsby-starter-hello-world', desc: "this is a gatsby project" },
]

const resolvers = {
  Query: {
    bookmark: async (root, args, context) => {
      try{
        var client = new faunadb.Client({ secret: "fnAECRxNihACAUJ752G6KsdAYEGe98vzs419eRsp" });
        var result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("url"))),
            q.Lambda(x =>q.Get(x))
          )
        )
        return result.data.map(d => {
          return {
            id: d.ts,
            url: d.data.url,
            desc: d.data.desc,
          }
        })

      }
      catch (err){
        console.error('err',err);
      }
    },  
  },
  Mutation: {
    addBookmark: (__, {url, desc}) => {
      var client = new faunadb.Client({ secret: "fnAECRxNihACAUJ752G6KsdAYEGe98vzs419eRsp" });
      try {
        var result = await client.query(
          q.Create(
            q.Collection('links'),
            { data: { 
              url, 
              desc
             } },
          )
        );
        console.log("Document Created and Inserted in Container: " + result.ref.id);
        return result.ref.data
        
      } 
      catch (error){
          console.log('Error: ');
          console.log(error);
      }
      console.log('url--desc', url, 'desc', desc);
      
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
