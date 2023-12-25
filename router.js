import express from "express"

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/authorization");
})

router.get("/authorization", (req, res) => {
  //res.render("authorization.ejs");
  console.log('authorization')
  res.render("authorization.html");
})


router.get("/gamescreen", (req, res) => {
  console.log('gamescreen')
  res.render("gamescreen.html");
})

router.get("/score", (req, res) => {
  console.log('score')
  res.render("score.html");
  //res.render("game_over.ejs");
})



router.get("/game", (req, res) => {
  //res.render("game.ejs");
})

export default router

