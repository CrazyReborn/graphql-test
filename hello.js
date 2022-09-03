var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

const schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query {
    getMessage(id: ID!): Message
  }
`);

let fakeDatabase = {};

class Message {
  constructor(id, {content, author} ) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

const root = {
  getMessage: ({ id }) => {
    if(!fakeDatabase[id]) {
      throw new Error('No message with id ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: ({ input }) => {
    const id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, fakeDatabase[id]);
  },
  updateMessage: ({ id, input }) => {
    if(!fakeDatabase[id]) {
      throw new Error('No message with id ' + id);
    };

    fakeDatabase[id] = input;
    return new Message(id, fakeDatabase[id]);
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');