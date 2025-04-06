const Users = require('../model/Users.js');
const client = require("./Redis")

async function getNearestUsers(lat, long, radius = 100, unit = "km", count = 100) {
  const users = await client.georadius(
      "users_location",
      long,
      lat,
      radius,
      unit,
      "WITHDIST",
      "COUNT",
      count,
      "ASC" // Sort by nearest first
  );
  return users.map(([userId, distance]) => ({ userId, distance }));
}

  async function updateUserLocation(userId, long, lat) {
    const data = await client.geoadd("users_location", long,lat, userId);
    return data;
}

async function getUserLocation(userId) {
  console.log(userId);
  const location = await client.geopos("users_location", userId);
  return location ? { longitude: location[0][0], latitude: location[0][1] } : null;
}


  module.exports = { getNearestUsers,getUserLocation,updateUserLocation};