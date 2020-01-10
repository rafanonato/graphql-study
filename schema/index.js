const { books } = require("./books");
const { user } = require("./users")

const { gql, PubSub } = require("apollo-server");

const BOOK_ADDED = 'BOOK_ADDED'
const USER_ADD = 'USER_ADD'

const pubsub = new PubSub();

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type User {
    user: String
    pass: String
  }

  type Query {
    books: [Book]
    user: [User]
  }

  type Mutation {
    addBook(title: String, author: String): Book
    addUser(user:String, pass: String): User
  }

  type Subscription {
    bookAdded: Book
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    user: ()=> user
  },
  Mutation: {
    async addBook(_, { title, author }) {
      books.push({ title, author });
      await pubsub.publish(BOOK_ADDED, { bookAdded: { title, author } });
      return { title, author };
    },

    async addUser(_, { user, pass }) {
      books.push({ user, pass });
      await pubsub.publish(USER_ADD, { userAdded: { user, pass } });
      return { user, pass };
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
