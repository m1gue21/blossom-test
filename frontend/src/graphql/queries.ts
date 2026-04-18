import { gql } from '@apollo/client';

export const GET_CHARACTERS = gql`
  query GetCharacters(
    $name: String
    $status: String
    $species: String
    $gender: String
    $origin: String
    $page: Int
    $sort: SortOrder
    $userId: String
    $onlyFavorites: Boolean
  ) {
    characters(
      name: $name
      status: $status
      species: $species
      gender: $gender
      origin: $origin
      page: $page
      sort: $sort
      userId: $userId
      onlyFavorites: $onlyFavorites
    ) {
      results {
        id
        externalId
        name
        status
        species
        gender
        originName
        locationName
        image
        isDeleted
        isFavorite
      }
      total
      page
      pages
    }
  }
`;

export const GET_CHARACTER = gql`
  query GetCharacter($id: Int!, $userId: String) {
    character(id: $id, userId: $userId) {
      id
      externalId
      name
      status
      species
      type
      gender
      originName
      locationName
      image
      episode
      url
      isDeleted
      isFavorite
      createdAt
      updatedAt
      comments {
        id
        author
        content
        createdAt
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($characterId: Int!, $author: String!, $content: String!) {
    addComment(characterId: $characterId, author: $author, content: $content) {
      id
      author
      content
      createdAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: Int!) {
    deleteComment(id: $id)
  }
`;

export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($characterId: Int!, $userId: String!) {
    toggleFavorite(characterId: $characterId, userId: $userId)
  }
`;

export const SOFT_DELETE_CHARACTER = gql`
  mutation SoftDeleteCharacter($id: Int!) {
    softDeleteCharacter(id: $id) {
      id
      isDeleted
    }
  }
`;

export const RESTORE_CHARACTER = gql`
  mutation RestoreCharacter($id: Int!) {
    restoreCharacter(id: $id) {
      id
      isDeleted
    }
  }
`;
