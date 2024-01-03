# Notes API
Developed an API to handle user authentication and notes using Express, Node and MongoDB.

### Why ?
- Node and Express: Node is one of the most popular runtimes and pretty simple and fast to develop apps with while also providing robust performance. Express is unopiniated and does not get in the way of development and also abstracts a lot of intricacies of building RESTful APIs.
- MongoDB : The schema of the data is simple and does not require joins or complicated schema. MongoDB is a robust NoSQL database and fits perfectly in this use case. It also supports Text indexing and searching out of the box which is a use case for our API.
- Rate Limiter : Express Rate Limiter can store the users and the number of requests in memory, and if needed to scale, we can move this to an external db as well.
- Jest (Testing) : Jest is a simple library to write test cases in express. It covers all of our use cases and is very powerful.

### Endpoints
Authentication Endpoints
- POST /api/auth/signup: create a new user account.
- POST /api/auth/login: log in to an existing user account and receive an access token.

Note Endpoints
- GET /api/notes: get a list of all notes for the authenticated user.
- GET /api/notes/:id: get a note by ID for the authenticated user.
- POST /api/notes: create a new note for the authenticated user.
- PUT /api/notes/:id: update an existing note by ID for the authenticated user.
- DELETE /api/notes/:id: delete a note by ID for the authenticated user.
- POST /api/notes/:id/share: share a note with another user for the authenticated user.
- GET /api/search?q=:query: search for notes based on keywords for the authenticated user.

### How to run ? 
1. Clone the repository
2. `cd` into the repository
3. `npm install` to install all the dependencies
4. Rename `.env.example` to `.env`
5. Add a local mongodb instance with 2 different databases (i) Test database (TEST_DB_URI) (ii) Main Database (DB_URI). You can use docker to start a MongoDB instance. Sample code given below.
7. `npm start` to run the app
8. `npm test` to run the tests

### Key Points
- The passwords are hashed using bcrpyt and stored in the DB. Raw passwords are **NOT STORED**. This improves the security of the app tremendously.
- JWTs are signed with only with email.
- The text is indexed for high performance search.
- The app is rate limited and can be controlled by config/rateLimiter.js.
- The code is structured for readability.

### What can be improved
- More tests can be added

### Extras
Run local mongodb with docker : 
1. Create a volume
```
docker volume create mongodb_data
```
2. Run the mongodb container. Don't forget to change `<your_mongodb_password>` and `<your_mongodb_password>`
```
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=<your_mongodb_password> \
  -e MONGO_INITDB_ROOT_PASSWORD=<your_mongodb_password> \
  -v mongodb_data:/data/db \
  --name mongodb_container \
  mongo
```
