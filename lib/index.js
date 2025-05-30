module.exports = {
  ...require("./utils"),
  ...require("./economy"),
  bot: require("./plugins").bot,
  lang: require(`../lang/${require("../config").LANG}.json`),
  ...require("./database"),
}
