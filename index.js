const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
const Exercise = require("./models/Exercise");
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
  const date = new Date(body.date);
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

  const activityToDisplay = {
    username: user.username,
    description: body.description,
    duration: body.duration,
    date: date.toDateString(),
    _id: userId,
  };

  res.send(activityToDisplay);
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
    foundUser.log = foundActivities;

    console.log(foundUser);

    res.send(foundUser);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  let foundUser = await User.findById(userId);
  console.log(foundUser);
  if (!foundUser) res.send({ error: "No user with this id" });

  const foundActivities = await Exercise.find({ userId: userId });

  if (foundActivities) {
    let filteredArray = foundActivities.filter((activity) => {
      let isValid = true;
      const activityDate = new Date(activity.date).getTime();
      const fromDate = new Date(from).getTime();
      const toDate = new Date(to).getTime();

      console.log(fromDate);
      console.log(activityDate);

      if (fromDate && fromDate > activityDate) isValid = false;
      if (toDate && toDate < activityDate) isValid = false;
      console.log(isValid);
      return isValid;
    });

    if (limit) filteredArray = filteredArray.splice(0, limit);

    filteredArray = filteredArray.map((activity) => {
      const formattedDate = new Date(activity.date).toDateString();
      activity = { ...activity._doc, date: formattedDate };
      return activity;
    });

    console.log(filteredArray);
    foundUser = {
      ...foundUser._doc,
      count: filteredArray.length,
      log: filteredArray,
    };
    // foundUser.log = foundActivities;

    console.log(foundUser);

    res.send(foundUser);
  }

  // console.log(foundActivities);

  // foundUser.log = foundActivities;
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
