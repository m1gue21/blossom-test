/**
 * GraphQL documentation for Swagger.
 *
 * The server only exposes POST /graphql. The paths here (/graphql/queries/*, /graphql/mutations/*)
 * are documentation aliases: each operation shows the JSON body for POST /graphql.
 */

/**
 * @openapi
 * /graphql/queries/characters:
 *   post:
 *     tags: [Characters]
 *     summary: List characters with optional filters
 *     description: |
 *       Fetch a paginated list of characters. Supports filtering by name, status, species, gender, and origin.
 *       Results can be sorted A→Z or Z→A.
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL query:**
 *       ```graphql
 *       query GetCharacters(
 *         $name: String
 *         $status: String
 *         $species: String
 *         $gender: String
 *         $origin: String
 *         $page: Int
 *         $sort: SortOrder
 *         $userId: String
 *       ) {
 *         characters(
 *           name: $name, status: $status, species: $species,
 *           gender: $gender, origin: $origin, page: $page,
 *           sort: $sort, userId: $userId
 *         ) {
 *           results { id name status species gender image originName locationName isFavorite isDeleted }
 *           total page pages
 *         }
 *       }
 *       ```
 *     operationId: getCharacters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           examples:
 *             allCharacters:
 *               summary: All characters (first page, A-Z)
 *               value:
 *                 query: "{ characters(page: 1, sort: asc) { total pages results { id name status species image } } }"
 *             filterByStatus:
 *               summary: Filter by status Alive
 *               value:
 *                 query: "query($status: String) { characters(status: $status) { total results { id name status } } }"
 *                 variables:
 *                   status: "Alive"
 *             filterByName:
 *               summary: Search by name
 *               value:
 *                 query: "query($name: String) { characters(name: $name) { total results { id name } } }"
 *                 variables:
 *                   name: "Rick"
 *             filterBySpeciesAndGender:
 *               summary: Filter Human females
 *               value:
 *                 query: "query($species: String, $gender: String) { characters(species: $species, gender: $gender) { total results { id name species gender } } }"
 *                 variables:
 *                   species: "Human"
 *                   gender: "Female"
 *             sortDescending:
 *               summary: Sort Z → A
 *               value:
 *                 query: "{ characters(sort: desc) { results { id name } } }"
 *     responses:
 *       200:
 *         description: Paginated character list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/GraphQLResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         characters:
 *                           $ref: '#/components/schemas/PaginatedCharacters'
 *             example:
 *               data:
 *                 characters:
 *                   total: 15
 *                   page: 1
 *                   pages: 1
 *                   results:
 *                     - id: 1
 *                       name: Rick Sanchez
 *                       status: Alive
 *                       species: Human
 *                       gender: Male
 *                       image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg"
 *                       originName: Earth (C-137)
 *                       locationName: Citadel of Ricks
 *                       isFavorite: false
 *                       isDeleted: false
 */

/**
 * @openapi
 * /graphql/queries/character:
 *   post:
 *     tags: [Characters]
 *     summary: Get a single character by ID
 *     description: |
 *       Fetch full details of one character including episode list and comments.
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL query:**
 *       ```graphql
 *       query GetCharacter($id: Int!, $userId: String) {
 *         character(id: $id, userId: $userId) {
 *           id name status species type gender
 *           originName locationName image episode url
 *           isDeleted isFavorite
 *           comments { id author content createdAt }
 *         }
 *       }
 *       ```
 *     operationId: getCharacter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           examples:
 *             getById:
 *               summary: Get character with id=1
 *               value:
 *                 query: "query($id: Int!, $userId: String) { character(id: $id, userId: $userId) { id name status species type gender originName locationName image episode isFavorite comments { id author content createdAt } } }"
 *                 variables:
 *                   id: 1
 *                   userId: "user_abc123"
 *     responses:
 *       200:
 *         description: Character detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/GraphQLResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         character:
 *                           $ref: '#/components/schemas/Character'
 */

/**
 * @openapi
 * /graphql/mutations/add-comment:
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a character
 *     description: |
 *       Adds a new comment to a character. Comments are public and linked by `characterId`.
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL mutation:**
 *       ```graphql
 *       mutation AddComment($characterId: Int!, $author: String!, $content: String!) {
 *         addComment(characterId: $characterId, author: $author, content: $content) {
 *           id author content createdAt
 *         }
 *       }
 *       ```
 *     operationId: addComment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           example:
 *             query: "mutation($characterId: Int!, $author: String!, $content: String!) { addComment(characterId: $characterId, author: $author, content: $content) { id author content createdAt } }"
 *             variables:
 *               characterId: 1
 *               author: "John Doe"
 *               content: "Rick is the best scientist in the multiverse!"
 *     responses:
 *       200:
 *         description: Created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GraphQLResponse'
 *             example:
 *               data:
 *                 addComment:
 *                   id: 1
 *                   author: John Doe
 *                   content: "Rick is the best scientist in the multiverse!"
 *                   createdAt: "2026-04-15T12:00:00.000Z"
 */

/**
 * @openapi
 * /graphql/mutations/delete-comment:
 *   post:
 *     tags: [Comments]
 *     summary: Delete a comment by id
 *     description: |
 *       Permanently removes a comment. The character must exist and not be soft-deleted.
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL mutation:**
 *       ```graphql
 *       mutation DeleteComment($id: Int!) {
 *         deleteComment(id: $id)
 *       }
 *       ```
 *     operationId: deleteComment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           example:
 *             query: "mutation($id: Int!) { deleteComment(id: $id) }"
 *             variables:
 *               id: 1
 *     responses:
 *       200:
 *         description: Returns true if deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GraphQLResponse'
 *             example:
 *               data:
 *                 deleteComment: true
 */

/**
 * @openapi
 * /graphql/mutations/toggle-favorite:
 *   post:
 *     tags: [Favorites]
 *     summary: Toggle a character as favorite
 *     description: |
 *       Adds or removes a character from the user's favorites list.
 *       Returns `true` if it was added, `false` if it was removed.
 *       Favorites are tied to a `userId` (generated automatically in the frontend via localStorage).
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL mutation:**
 *       ```graphql
 *       mutation ToggleFavorite($characterId: Int!, $userId: String!) {
 *         toggleFavorite(characterId: $characterId, userId: $userId)
 *       }
 *       ```
 *     operationId: toggleFavorite
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           examples:
 *             addFavorite:
 *               summary: Add to favorites
 *               value:
 *                 query: "mutation($characterId: Int!, $userId: String!) { toggleFavorite(characterId: $characterId, userId: $userId) }"
 *                 variables:
 *                   characterId: 1
 *                   userId: "user_abc123"
 *     responses:
 *       200:
 *         description: Returns true (added) or false (removed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GraphQLResponse'
 *             examples:
 *               added:
 *                 summary: Favorite added
 *                 value:
 *                   data:
 *                     toggleFavorite: true
 *               removed:
 *                 summary: Favorite removed
 *                 value:
 *                   data:
 *                     toggleFavorite: false
 */

/**
 * @openapi
 * /graphql/mutations/soft-delete-character:
 *   post:
 *     tags: [Soft Delete]
 *     summary: Soft-delete a character
 *     description: |
 *       Marks a character as deleted (`isDeleted: true`). The character is hidden from
 *       regular queries but remains in the database and can be restored.
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL mutation:**
 *       ```graphql
 *       mutation SoftDeleteCharacter($id: Int!) {
 *         softDeleteCharacter(id: $id) { id isDeleted }
 *       }
 *       ```
 *     operationId: softDeleteCharacter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           example:
 *             query: "mutation($id: Int!) { softDeleteCharacter(id: $id) { id isDeleted } }"
 *             variables:
 *               id: 1
 *     responses:
 *       200:
 *         description: Updated character with isDeleted=true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GraphQLResponse'
 *             example:
 *               data:
 *                 softDeleteCharacter:
 *                   id: 1
 *                   isDeleted: true
 */

/**
 * @openapi
 * /graphql/mutations/restore-character:
 *   post:
 *     tags: [Soft Delete]
 *     summary: Restore a soft-deleted character
 *     description: |
 *       Restores a previously soft-deleted character (`isDeleted: false`).
 *
 *       **HTTP real:** `POST /graphql` with the JSON body below.
 *
 *       **GraphQL mutation:**
 *       ```graphql
 *       mutation RestoreCharacter($id: Int!) {
 *         restoreCharacter(id: $id) { id isDeleted }
 *       }
 *       ```
 *     operationId: restoreCharacter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GraphQLRequest'
 *           example:
 *             query: "mutation($id: Int!) { restoreCharacter(id: $id) { id isDeleted } }"
 *             variables:
 *               id: 1
 *     responses:
 *       200:
 *         description: Updated character with isDeleted=false
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GraphQLResponse'
 *             example:
 *               data:
 *                 restoreCharacter:
 *                   id: 1
 *                   isDeleted: false
 */

export {};
