const { ApolloServer, PubSub } = require('apollo-server-express');
const { Client } = require('pg');
const express = require('express');
const { createServer } = require('http');
const { readFileSync } = require('fs');

const resolvers = require('./resolver');

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const connectionString = `postgressql://localhost:5432/buycoins`;

function start() {
  // setup postgres db
  //   const connectionString = '';
  const client = new Client({
    connectionString
  });

  client
    .connect()
    .then(() => console.log('Connected to Database'))
    .catch(() => console.log('Error occurred during database connection'));

  // client.query('INSERT into conversion(id, result) VALUES(4, 20) ', (err, res) => {
  //     console.log({err, res})
  //     client.end()
  // })
  // Create a new instance of the server
  const app = express();

  // Send it an object with typeDefs(the schema) and resolvers
  const pubsub = new PubSub();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    context: (req, res) => ({ pubsub, client, req, res })
  });

  server.applyMiddleware({ app });

  //   app.get('/', (req, res) => {
  //     res.redirect('graphiql');
  //   });

  app.get('/:url', async (req, res) => {
    const { url } = req.params;

    const result = await client.query(
      `SELECT * from urlshortener WHERE "unique" = '${url}'`
    );

    if (result.rows.length === 0) {
      return res.end('Invalid short link');
    }
    // remove the forward slash
    const foundUrl = result.rows[0];
    return res.redirect(foundUrl.url);
  });

  //   app.get('/graphiql', expressPlayground({ endpoint: '/graphql' }));

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  // Call listen on the server to launch the web server
  httpServer.listen({ port: process.env.PORT || 4000 }, () =>
    console.log(
      `GraphQL Server running at http://localhost:4000${server.graphqlPath} and socket is running at ws://localhost:4000/graphql`
    )
  );
}

start();
