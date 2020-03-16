const mongoose = require("mongoose");
// const HackModel = require("./model/hack");

let conn = null;
const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@ds157136.mlab.com:57136/hackone`;

/**
 * Lists all Hacks currently stored in the database
 * @param {*} event
 * @param {*} context
 */
export const list = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (conn == null) {
    conn = await mongoose.createConnection(url, {
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    conn.model(
      "Hack",
      new mongoose.Schema({ title: String, description: String, goal: String, team: Array })
    );
    conn.model("User", new mongoose.Schema({ name: String, email: String }));
  }
  const Query = conn.model("Hack");
  const Teams = conn.model("User");

  /**
   * To be used in the future This will return One document
   * const doc = await Query.findOne({_id: '5e6094446a56971ad6a32d7b'});
   */
  try {
    const doc = await Query.find();
    const users = await Teams.find();
    for(const hack_key in doc){
      for(const team_key in doc[hack_key].team){
        users.forEach(member => {
          if(JSON.stringify(member._id) == JSON.stringify(doc[hack_key].team[team_key])){
            doc[hack_key].team[team_key] = {_id: member._id, name: member.name};
          }
        });
      }
    }
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(doc)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
        "Access-Control-Allow-Credentials": true
      },
      body: "Uable to fetch hacks data"
    };
  }
};
