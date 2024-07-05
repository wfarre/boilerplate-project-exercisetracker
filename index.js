const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
const Exercise = require("./models/Exercise");
const ExerciseFactory = require("./Factories/ExerciseFactory");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  if (!username) res.send({ error: "oops! username cannot be empty" });
  const newUser = { username: username };
  const newUserToSave = new User(newUser);
  newUserToSave.save();
  res.send(newUserToSave);
});

app.get("/api/users", async (req, res) => {
  const allUsers = await User.find({});

  res.send(allUsers);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const body = req.body;
  const userId = req.params._id;
  const date = body.date ? new Date(body.date) : new Date();
  const user = await User.findById(userId);

  console.log(user);

  if (!user) res.send({ error: "user not found" });

  const newActivity = {
    description: body.description,
    duration: body.duration,
    date: date.toDateString(),
    userId: userId,
  };

  const newActivityToSave = new Exercise(newActivity);

  newActivityToSave.save();

  // const activityToDisplay = {
  //   username: user.username,
  //   description: body.description,
  //   duration: body.duration,
  //   date: date.toDateString(),
  //   _id: userId,
  // };

  const userWithNewActivity = {
    ...user._doc,
    ...newActivity,
  };

  res.send(userWithNewActivity);
});

app.get("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  console.log(userId);

  let foundUser = await User.findById(userId);
  console.log(foundUser);
  if (!foundUser) res.send({ error: "No user with this id" });

  const foundActivities = await Exercise.find({ userId: userId });

  if (foundActivities) {
    const filteredArray = foundActivities.map((activity) => {
      const formattedDate = new Date(activity.date).toDateString();
      activity = { ...activity._doc, date: formattedDate };
      return activity;
    });

    foundUser = {
      ...foundUser._doc,
      count: filteredArray.length,
      log: filteredArray,
    };

    res.send(foundUser);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  let foundUser = await User.findById(userId);
  if (!foundUser) res.send({ error: "No user with this id" });

  const foundActivities = await Exercise.find({ userId: userId });

  if (foundActivities) {
    let filteredArray = foundActivities.filter((activity) => {
      let isValid = true;
      const activityDate = new Date(activity.date).getTime();
      const fromDate = new Date(from).getTime();
      const toDate = new Date(to).getTime();

      if (fromDate && fromDate > activityDate) isValid = false;
      if (toDate && toDate < activityDate) isValid = false;
      return isValid;
    });

    if (limit) filteredArray = filteredArray.splice(0, limit);

    filteredArray = filteredArray.map((activity) => {
      const formattedDate = new Date(activity.date).toDateString();
      activity = {
        description: activity.description,
        duration: activity.duration ? activity.duration : 0,
        date: formattedDate,
      };
      return activity;
    });

    const userToDisplay = {
      username: foundUser.username,
      count: filteredArray.length,
      _id: userId,
      log: filteredArray,
    };

    res.send(userToDisplay);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
