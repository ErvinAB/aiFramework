const { faker } = require('@faker-js/faker');

const testData = {
    username: faker.internet.username(),
    password: faker.internet.password()
};

console.log(JSON.stringify(testData, null, 2));
