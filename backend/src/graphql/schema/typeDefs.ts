import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Character {
    id: Int!
    externalId: Int!
    name: String!
    status: String!
    species: String!
    type: String
    gender: String!
    originName: String!
    locationName: String!
    image: String!
    episode: [String]
    url: String!
    isDeleted: Boolean!
    isFavorite: Boolean
    comments: [Comment]
    favorites: [Favorite]
    createdAt: String
    updatedAt: String
  }

  type Comment {
    id: Int!
    characterId: Int!
    author: String!
    content: String!
    createdAt: String
  }

  type Favorite {
    id: Int!
    characterId: Int!
    userId: String!
    createdAt: String
  }

  type PaginatedCharacters {
    results: [Character!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type Query {
    characters(
      name: String
      status: String
      species: String
      gender: String
      origin: String
      page: Int
      sort: SortOrder
      userId: String
      onlyFavorites: Boolean
    ): PaginatedCharacters!

    character(id: Int!, userId: String): Character
  }

  type Mutation {
    addComment(characterId: Int!, author: String!, content: String!): Comment!
    deleteComment(id: Int!): Boolean!
    toggleFavorite(characterId: Int!, userId: String!): Boolean!
    softDeleteCharacter(id: Int!): Character!
    restoreCharacter(id: Int!): Character!
  }

  enum SortOrder {
    asc
    desc
  }
`;
