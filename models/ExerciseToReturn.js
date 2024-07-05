module.exports = class ExerciseToReturn {
  constructor(data) {
    this._exId = data.userId;
    this._date = new Date(data.date).toDateString();
    this._duration = data.duration;
    this._description = data.description;
  }

  get _id() {
    return this._exId;
  }

  get date() {
    return this._date;
  }

  get duration() {
    return this._duration;
  }

  get description() {
    return this._description;
  }
};
