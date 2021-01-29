const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeUsersArray } = require("./users.fixtures");
const { makePostsArray } = require("./posts.fixtures");
const { makeCharactersArray } = require("./characters.fixtures");
const { makeCampaignsArray } = require("./campaigns.fixtures");

const CampaignService = require("../src/campaign/campaign-service");
const PostService = require("../src/post/post-service");
const CharacterService = require("../src/character/character-service");

describe(`Campaign service object`, function () {
  let db;
  let authToken;

  before(`setup db`, () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  beforeEach("register and login", () => {
    let users = makeUsersArray();
    return supertest(app)
      .post("/api/users")
      .send(users[0])
      .then((res) => {
        return supertest(app)
          .post("/api/auth/login")
          .send(users[0])
          .then((res2) => {
            authToken = res2.body.authToken;
          });
      });
  });

  function makeAuthHeader(user) {
    const testUser = { password: user.password, username: user.username };
    return supertest(app)
      .post("/login")
      .set("Authorization", `Bearer ${authToken}`)
      .send(testUser);
  }

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw(
      "TRUNCATE users, campaigns, characters, posts RESTART IDENTITY CASCADE"
    )
  );

  afterEach("cleanup", () =>
    db.raw(
      "TRUNCATE users, campaigns, characters, posts RESTART IDENTITY CASCADE"
    )
  );

  describe(`GET /api/campaign`, () => {
    context(`Given no campaigns,`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/campaign")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, []);
      });
    });

    context("Given there are characters in the db", () => {
      const testUsers = makeUsersArray();
      const testCampaigns = makeCampaignsArray();
      const testCharacters = makeCharactersArray();
      const testPosts = makePostsArray();

      beforeEach("insert campaign", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("campaigns").insert(testCampaigns);
          })
          .then(() => {
            return db.into("characters").insert(testCharacters);
          })
          .then(() => {
            return db.into("posts").insert(testPosts);
          });
      });

      it("Responds with 200 and all of the posts", () => {
        return supertest(app)
          .get("/api/post")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, testPosts);
      });
    });
  });
  describe(`GET /api/post/:id`, () => {
    context(`Given no posts`, () => {
      it(`responds with 404`, () => {
        const postId = 123456;
        return supertest(app)
          .get(`/api/post/${postId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Post doesn't exist` } });
      });
    });

    context("Given there are posts in the database", () => {
      const testUsers = makeUsersArray();
      const testCampaigns = makeCampaignsArray();
      const testCharacters = makeCharactersArray();
      const testPosts = makePostsArray();

      beforeEach("insert posts", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("campaigns").insert(testCampaigns);
          })
          .then(() => {
            return db.into("characters").insert(testCharacters);
          })
          .then(() => {
            return db.into("posts").insert(testPosts);
          });
      });
      it("responds with 200 and the specified post", () => {
        const post_id = 2;
        const expectedPost = testPosts[post_id - 1];
        return supertest(app)
          .get(`/api/post/${post_id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, expectedPost);
      });
    });
  });
  describe(`POST /api/posts`, () => {
    const testUsers = makeUsersArray();
    const testCampaigns = makeCampaignsArray();
    const testCharacters = makeCharactersArray();
    const testPosts = makePostsArray();

    beforeEach("insert post", () => {
      return db
        .into("users")
        .insert(testUsers)
        .then(() => {
          return db.into("characters").insert(testCharacters);
        });
    });
    it(`creates a habit, responding with 201 and the new character`, () => {
      const newCharacter = {
        id: 1,
        user_id: 1,
        campagin_id: 2,
        datecreated: "01/12/2021",
        name: "Legolas 2",
        race: "elf",
        characterClass: "ranger",
        level: 2,
        additionalinfo: "lord of the rings 2",
      };
      return supertest(app)
        .post("/api/characters")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newCharacter)
        .expect(201)
        .expect((res) => {
          expect(res.body.user_id).to.eql(newCharacter.user_id);
          expect(res.body.campagin_id).to.eql(newCharacter.campagin_id);
          expect(res.body.name).to.eql(newCharacter.name);
          expect(res.body.race).to.eql(newCharacter.race);
          expect(res.body.characterClass).to.eql(newCharacter.characterClass);
          expect(res.body.level).to.eql(newCharacter.level);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/character/${res.body.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.start_date)
          );
          expect(actual).to.eql(expected);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/character/${res.body.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(res.body)
        );
    });
    const requiredFields = ["user_id", "campaign_id", "id"];

    requiredFields.forEach((field) => {
      const newCampaign = {
        id: 2,
        datecreated: "01/01/2021",
        name: "A Journey Near and Far 2",
        completed: false,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newCampaign[field];

        return supertest(app)
          .post("/api/campaign")
          .set("Authorization", `Bearer ${authToken}`)
          .send(newCampaign)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });
  });
  describe(`DELETE /api/campaign/:id`, () => {
    context(`Given no campaign`, () => {
      it(`responds with 404`, () => {
        const campaign_id = 123456;
        return supertest(app)
          .delete(`/api/campaign/${campaign_id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Campaign doesn't exist` } });
      });
    });

    context("Given there are habits in the database", () => {
      const testUsers = makeUsersArray();
      const testCampaigns = makeCampaignsArray();

      beforeEach("insert campaign", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("campaign").insert(testCampaigns);
          });
      });

      it("responds with 204 and removes the campaign", () => {
        const idToRemove = 2;
        const expectedCampaign = testCampaigns.filter(
          (campaign) => campaign.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/campaign/${idToRemove}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/campaign`).expect(expectedCampaign);
          });
      });
    });
  });
  describe(`PATCH /api/campaign/:id`, () => {
    context(`Given no campaign`, () => {
      it(`responds with 404`, () => {
        const testId = 123456;
        return supertest(app)
          .delete(`/api/campaign/${testId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Campaign doesn't exist` } });
      });
    });

    context("Given there are characters in the database", () => {
      const testUsers = makeUsersArray();
      const testCampaigns = makeCampaignsArray();
      const testCharacters = makeCharactersArray();

      beforeEach("insert habits", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("campaigns").insert(testCampaigns);
          })
          .then(() => {
            return db.into("characters").insert(testCharacters);
          });
      });

      it("responds with 204 and updates the character", () => {
        const idToUpdate = 2;
        const updateCharacter = {
          id: 5,
          user_id: 1,
          campagin_id: 2,
          datecreated: "01/13/2021",
          name: "Legolas 4",
          race: "elf",
          characterClass: "ranger",
          level: 4,
          additionalinfo: "lord of the rings 3",
        };
        const expectedCharacter = {
          ...testCharacters[idToUpdate - 1],
          ...updateCharacter,
        };
        return supertest(app)
          .patch(`/api/character/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateHabit)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/character/${idToUpdate}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedCharacter)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/character/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must contain either 'characterClass' or 'race'`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateCharacter = {
          name: "updated character name",
        };
        const expectedCharacter = {
          ...testCharacters[idToUpdate - 1],
          ...updateCharacter,
        };

        return supertest(app)
          .patch(`/api/character/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            ...updateHabit,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/character/${idToUpdate}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedCharacter)
          );
      });
    });
  });
  describe(`PUT /api/character/:id`, () => {
    context(`Given no characters`, () => {
      it(`responds with 404`, () => {
        const testId = 123456;
        return supertest(app)
          .delete(`/api/character/${testId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `character doesn't exist` } });
      });
    });
  });
});
