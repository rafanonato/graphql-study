const { books } = require("./books");
const { gql, PubSub } = require("apollo-server");

const BOOK_ADDED = 'BOOK_ADDED'

const pubsub = new PubSub();

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }

  type Mutation {
    addBook(title: String, author: String): Book
  }

  type Subscription {
    bookAdded: Book
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books
  },
  Mutation: {
    async addBook(_, { title, author }) {
      books.push({ title, author });
      await pubsub.publish(BOOK_ADDED, { bookAdded: { title, author } });
      return { title, author };
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator([BOOK_ADDED])
    }
  },
};

module.exports = {
  typeDefs,
  resolvers
};
