const ExerciseToReturn = require("../models/ExerciseToReturn");

module.exports = class ExerciseFactory {
  constructor(data, type) {
    if (type === "v1") new ExerciseToReturn(data);
  }
};
