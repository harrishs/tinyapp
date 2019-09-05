const { assert } = require("chai");

const lookUp = require("../helper");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("lookUp", function() {
  it("should return true if a user with given address exists", function() {
    const user = lookUp("user@example.com", testUsers, "email");
    const expectedOutput = true;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});

describe("lookUp", function() {
  it("should return user id when given email and '' as key value", function() {
    const user = lookUp("user@example.com", testUsers, "");
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});
