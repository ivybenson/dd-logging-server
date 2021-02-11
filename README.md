# Dungeons Truth - API

Tell your story your way

Live app: (https://dungeons-truth-ggdcc6s1c.vercel.app/

## Intro

Dungeons Truth is an app that role playing game players can use to create a more rounded out experience when playing the game. When players can only meet when their whole party can play, it can be hard to remember every detail of the story. Dungeons Truth acts as a platform to log the players and characters experiences throughout the campaign. Upon log in users create a campaign that displays a code. Once the code is created all players can add themselves into the game on the same campaign code log their journey together. Users log their player information including name, character race, class, level, and any additional information they would like to track. On campaign log users can post publicly and privately taking down towns they have traveled to, who they meet, what creatures they fight, and magical objects they pick. As campaigns can take weeks to months to years it is hard to remember everything the players and characters have gotten up to in their journey. Log in and tell your story with Dungeons Truth.

## Technologies

- Node and Express
  - Authentication via JWT
  - RESTful API
- Testing
  - Supertest (integration)
    -Mocha and Chai (unit)
- Database
  - Postgres SQL
  - Knex.js

## Deployed with Heroku

## API Endpoints

### Users Router

```

-/api/users

-- GET - gets all users

-- POST - creates a new user
```

### Campaign Router

```

-/api/campaign/

-- GET - gets campaign by user

-- POST - creates a new campaign
```

### Campaign/:campaign_id Router

```

-/api/campaign/:campaign_id

-- GET - gets campaign by campaign_id

-- POST - creates a temporary character to attach to the campaign for the creator

```

### Character Router

```

-/api/character/

-- GET - gets character by user

-- DELETE - creates a new character by campaign name
```

### Character/:id Router (not in use for current version)

```

-/api/character/:character_id

-- GET - gets character by user_id

-- PUT - updates character by id
```

### Post Router

```
-/api/post

-- GET - gets all posts attached to character ids

-- POST - creates new post in campaign
```

### Post/:post_id Router

```

-/api/progress/:byhabits

-- GET - gets posts in campaign
```
