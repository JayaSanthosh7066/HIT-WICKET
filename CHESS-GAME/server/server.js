import { Server, OPEN } from "ws";
const wss = new Server({ port: 3000 });
let gameState = {
  grid: [
    ["A-P", "A-H1", "A-H2", "A-H3", "A-P2"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P", "B-H1", "B-H2", "B-H3", "B-P2"],
  ],
  turn: "PlayerA",
};
wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.send(JSON.stringify({ type: "gameState", data: gameState }));
  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case "makeMove":
        const { row, col, player } = parsedMessage.data;
        if (gameState.turn === player) {
          gameState.grid[row][col] = `${player}-P`;
          gameState.turn = player === "PlayerA" ? "PlayerB" : "PlayerA";

          wss.clients.forEach((client) => {
            if (client.readyState === OPEN) {
              client.send(
                JSON.stringify({ type: "gameState", data: gameState })
              );
            }
          });
        }
        break;

      default:
        console.log("Unknown message type:", parsedMessage.type);
    }
  });
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
console.log("WebSocket server is running on ws://localhost:8080");
