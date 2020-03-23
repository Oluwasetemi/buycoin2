const randomString = require('randomstring');

const host = 'localhost';

const store = [{ shortUrl: 'longUrl' }];

// exports.store = store;

const Query = {
  shortenUrl: async (parent, { url }, { client }) => {
    try {
      // generate the 4, 5 unique character
      const unique = randomString.generate(5);
      // map the url from the args to the unique character maybe in an object
      // insert data
      const insertData = `INSERT into urlshortener(url, "unique") VALUES($1, $2) RETURNING *`;
      const data = [url, unique];

      const done = await client.query(insertData, data);
      // return the shortened url
      return { url: `http://localhost:4000/${unique}` };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

const resolvers = {
  Query
};

module.exports = resolvers;
