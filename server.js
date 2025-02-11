const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
require("dotenv").config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:4040/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        console.log("GitHub Profile Data:", profile);
      return done(null, profile);
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: "http://localhost:4040/auth/twitter/callback",
    },
    (token, tokenSecret, profile, done) => {
      // User data is in the `profile` object
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
      if (req.user) {
        const userData = JSON.stringify(req.user);
  
        res.redirect(
          `http://localhost:5173?user=${encodeURIComponent(userData)}`
        );
      } else {
        console.log("No user data found");
        res.redirect("http://localhost:5173");
      }
    }
  );

  app.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/" }),
    (req, res) => {
      // After successful login, redirect with user data
      const user = encodeURIComponent(JSON.stringify(req.user));
      res.redirect(`http://localhost:5173?user=${user}`);
    }
  );
  

app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("http://localhost:5173");
});

app.listen(4040, () => console.log("Server running on port 4040"));
