const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log("DB Error: ${e.message}");
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayerQuery = `
     SELECT * FROM cricket_team;`;
  const playerArray = await database.all(getPlayerQuery);
  res.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const player = await database.get(getPlayerQuery);
  res.send(convertDbObjectToResponseObject(player));
});

app.post("/players/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const postPlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const player = await database.run(postPlayerQuery);
  res.send("Player Added to Team");
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const { playerId } = req.params;
  const updatePlayerQuery = `UPDATE cricket_team SET 
        player_name = '${playerName}',jersey_number= ${jerseyNumber},role = '${role}' WHERE player_id = ${playerId};`;
  await database.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id= ${playerId}`;
  await database.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
