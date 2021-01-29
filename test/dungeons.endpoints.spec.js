const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeUsersArray } = require("./users.fixtures");
const { makeHabitArray } = require("./habits.fixtures");
const { makeProgressArray } = require("./progress.fixtures");

const HabitsService = require("../src/habits/habit-service");

describe(`Habits service object`, function () {
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
    db.raw("TRUNCATE users, hbits, progress RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE users, hbits, progress RESTART IDENTITY CASCADE")
  );

  describe(`GET /api/habits`, () => {
    context(`Given no habits,`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/habits")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, []);
      });
    });

    context("Given there are habits in the db", () => {
      const testUsers = makeUsersArray();
      const testHabits = makeHabitsArray();
      const testProgress = makeProgressArray();

      beforeEach("insert habits", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("categories").insert(testHabits);
          })
          .then(() => {
            return db.into("habits").insert(testhabits);
          });
      });

      it("Responds with 200 and all of the habits", () => {
        return supertest(app)
          .get("/api/habits")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, testhabits);
      });
    });
  });
  describe(`GET /api/habits/:id`, () => {
    context(`Given no habits`, () => {
      it(`responds with 404`, () => {
        const habitId = 123456;
        return supertest(app)
          .get(`/api/habits/${habitId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Habit doesn't exist` } });
      });
    });

    context("Given there are habits in the database", () => {
      const testUsers = makeUsersArray();
      const testHabits = makehabitsArray();
      const testProgrss = makeProgressArray();

      beforeEach("insert habits", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("categories").insert(testProgress);
          })
          .then(() => {
            return db.into("habits").insert(testHabits);
          });
      });
      it("responds with 200 and the specified habit", () => {
        const habit_id = 2;
        const expectedHabit = testhabits[habit_id - 1];
        return supertest(app)
          .get(`/api/habits/${habit_Id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, expectedHabit);
      });
    });
  });
  describe(`POST /api/habits`, () => {
    const testUsers = makeUsersArray();
    const testHabits = makeProgressArray();
    beforeEach("insert habit", () => {
      return db
        .into("users")
        .insert(testUsers)
        .then(() => {
          return db.into("progress").insert(testHabits);
        });
    });
    it(`creates a habit, responding with 201 and the new habit`, () => {
      const newHabit = {
        id: 1,
        category: "productivity",
        title: "test new habit",
        description: "test habit description",
        checked: false,
        category_id: 1,
        user_id: 1,
      };
      return supertest(app)
        .post("/api/habits")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newHabit)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).to.eql(newHabit.id);
          expect(res.body.title).to.eql(newHabit.title);
          expect(res.body.frequency).to.eql(newHabit.frequency);
          expect(res.body.user_id).to.eql(newHabit.user_id);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/habits/${res.body.id}`);
          const expected = new Intl.DateTimeFormat("en-US").format(new Date());
          const actual = new Intl.DateTimeFormat("en-US").format(
            new Date(res.body.start_date)
          );
          expect(actual).to.eql(expected);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/habits/${res.body.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(res.body)
        );
    });
    const requiredFields = ["title", "frequency", "note"];

    requiredFields.forEach((field) => {
      const newHabit = {
        id: 1,
        title: "journaling",
        frequency: 2,
        note: "Get your thoughts down every morning",
        user_id: 1,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newHabit[field];

        return supertest(app)
          .post("/api/habits")
          .set("Authorization", `Bearer ${authToken}`)
          .send(newHabit)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });
  });
  describe(`DELETE /api/habits/:id`, () => {
    context(`Given no habits`, () => {
      it(`responds with 404`, () => {
        const habit_id = 123456;
        return supertest(app)
          .delete(`/api/habits/${habit_id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Habit doesn't exist` } });
      });
    });

    context("Given there are habits in the database", () => {
      const testUsers = makeUsersArray();
      const testProgress = makeProgressArray();
      const testHabits = makehabitsArray();

      beforeEach("insert habit", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("categories").insert(testHabits);
          })
          .then(() => {
            return db.into("habits").insert(testProgress);
          });
      });

      it("responds with 204 and removes the habit", () => {
        const idToRemove = 2;
        const expectedhabits = testhabits.filter(
          (habit) => habit.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/habits/${idToRemove}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/habits`).expect(expectedhabits);
          });
      });
    });
  });
  describe(`PATCH /api/habits/:id`, () => {
    context(`Given no habits`, () => {
      it(`responds with 404`, () => {
        const testId = 123456;
        return supertest(app)
          .delete(`/api/habits/${testId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Habit doesn't exist` } });
      });
    });

    context("Given there are habits in the database", () => {
      const testUsers = makeUsersArray();
      const testHabits = makeHabitArray();
      const testProgress = makeProgressArray();

      beforeEach("insert habits", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("categories").insert(testHabits);
          })
          .then(() => {
            return db.into("habits").insert(testProgress);
          });
      });

      it("responds with 204 and updates the habit", () => {
        const idToUpdate = 2;
        const updateHabit = {
          title: "journaling",
          frequency: 5,
          created: "2020-01-03T00:00:00.000Z",
          note: "Get your thoughts down every morning",
          user_id: 1,
        };
        const expectedHabit = {
          ...testhabits[idToUpdate - 1],
          ...updateHabit,
        };
        return supertest(app)
          .patch(`/api/habits/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateHabit)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/habits/${idToUpdate}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedHabit)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/habits/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must contain either 'note' or 'frequency'`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateHabit = {
          title: "updated habit title",
        };
        const expectedHabit = {
          ...testhabits[idToUpdate - 1],
          ...updateHabit,
        };

        return supertest(app)
          .patch(`/api/habits/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            ...updateHabit,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/habits/${idToUpdate}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedHabit)
          );
      });
    });
  });
  describe(`PUT /api/habits/:id`, () => {
    context(`Given no habits`, () => {
      it(`responds with 404`, () => {
        const testId = 123456;
        return supertest(app)
          .delete(`/api/habits/${testId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Habit doesn't exist` } });
      });
    });
    context("Given there are habits in the database", () => {
      const testUsers = makeUsersArray();
      const testProgress = makeProgressArray();
      const testHabits = makehabitsArray();

      beforeEach("insert habits", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("categories").insert(testHabits);
          })
          .then(() => {
            return db.into("habits").insert(testProgress);
          });
      });
      it("responds with 204 and updates the habit", () => {
        const idToUpdate = 2;
        const updateHabit = {
          id: 2,
          checked: false,
        };
        const expectedHabit = {
          ...testhabits[idToUpdate - 1],
          ...updateHabit,
        };
        return supertest(app)
          .patch(`/api/habits/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateHabit)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/habits/${idToUpdate}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedHabit)
          );
      });
      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/habits/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must contain either 'frequency' or 'title'`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateHabit = {
          checked: true,
        };
        const expectedHabit = {
          ...testhabits[idToUpdate - 1],
          ...updateHabit,
        };

        return supertest(app)
          .patch(`/api/habits/${idToUpdate}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            ...updateHabit,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/habits/${idToUpdate}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedHabit)
          );
      });
    });
  });
});
