import { Context } from "@oak/oak";

type WebSocketWithUsername = WebSocket & { username: string };
type AppEvent = { event: string; [key: string]: any };
type Room = { name: string; private: boolean; password?: string };

export default class ChatServer {
  private connectedClients: Map<string, WebSocketWithUsername> = new Map();
  private rooms: Room[] = [];
  private userRooms: Map<string, string> = new Map(); 

  private polls = new Map<string, {
    question: string;
    options: string[];
    votes: Record<string, number>;
    allowMultiple: boolean;
    voters: Record<string, Set<string>>;
    timer: number;
    closeTime: number | null;
    creator: string;
    room: string;
  }>();

  public async handleConnection(ctx: Context) {
    const username = ctx.request.url.searchParams.get("username");

    if (!username) {
      ctx.response.status = 400;
      ctx.response.body = "Username is required";
      return;
    }

    if (this.connectedClients.has(username)) {
      ctx.response.status = 400;
      ctx.response.body = `Username "${username}" is already taken`;
      return;
    }

    const socket = await ctx.upgrade() as WebSocketWithUsername;
    socket.username = username;
    socket.onopen = this.broadcastUsernames.bind(this);
    socket.onclose = () => {
      this.clientDisconnected(socket.username);
    };
    socket.onmessage = (m) => {
      this.handleClientMessage(socket, m);
    };

    this.connectedClients.set(username, socket);
    console.log(`New client connected: ${username}`);
  }

  private handleClientMessage(socket: WebSocketWithUsername, message: MessageEvent) {
    const data = JSON.parse(message.data);

    switch (data.event) {
      case 'send-message': {
        const currentRoom = this.userRooms.get(socket.username) || "Global";

        for (const [username, clientSocket] of this.connectedClients.entries()) {
          const clientRoom = this.userRooms.get(username) || "Global";
          if (clientRoom === currentRoom) {
            clientSocket.send(JSON.stringify({
              event: 'send-message',
              username: socket.username,
              message: data.message
            }));
          }
        }
        break;
      }

      case 'create-poll':
        this.createPoll(
          socket.username,
          data.pollId,
          data.question,
          data.options,
          data.allowMultiple,
          data.timer
        );
        break;

      case 'vote':
        this.handleVote(socket.username, data.pollId, data.selectedOption);
        break;

      case 'close-poll':
        this.closePoll(data.pollId);
        break;

      case 'unvote':
        this.handleUnvote(socket.username, data.pollId, data.selectedOption);
        break;

      case "create-room":
        this.createRoom(data.roomName, data.isPrivate, data.password);
        break;

      case "join-room":
        this.handleJoinRoom(socket, data.room, data.password);
        break;

      case "leave-room":
        this.handleLeaveRoom(socket);
        break;
    }
  }

  private createPoll(username: string, pollId: string, question: string, options: string[], allowMultiple: boolean, timer: number) {
    const room = this.userRooms.get(username) || "Global";
    const votes = options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {});
    const closeTime = timer > 0 ? Date.now() + timer * 1000 : null;

    this.polls.set(pollId, {
      question,
      options,
      votes,
      allowMultiple,
      voters: {},
      timer,
      closeTime,
      creator: username,
      room
    });

    this.broadcastToRoom(room, {
      event: 'new-poll',
      pollId,
      question,
      options,
      allowMultiple,
      timer,
      creator: username
    });
  }

  private handleVote(username: string, pollId: string, selectedOption: string) {
    const poll = this.polls.get(pollId);
    if (!poll) return;

    const userRoom = this.userRooms.get(username) || "Global";
    if (poll.room !== userRoom) return;

    if (!poll.options.includes(selectedOption)) return;

    if (!poll.voters[username]) {
      poll.voters[username] = new Set();
    }

    const alreadyVotedOptions = poll.voters[username];

    if (!poll.allowMultiple && alreadyVotedOptions.size > 0) return;
    if (alreadyVotedOptions.has(selectedOption)) return;

    alreadyVotedOptions.add(selectedOption);
    poll.votes[selectedOption] += 1;

    this.broadcastToRoom(poll.room, {
      event: 'poll-vote',
      pollId,
      votes: poll.votes,
    });
  }

  private handleUnvote(username: string, pollId: string, selectedOption: string) {
    const poll = this.polls.get(pollId);
    if (!poll) return;

    const voterSet = poll.voters[username];
    if (!voterSet || !voterSet.has(selectedOption)) return;

    voterSet.delete(selectedOption);
    if (poll.votes[selectedOption] > 0) {
      poll.votes[selectedOption] -= 1;
    }

    this.broadcast({
      event: 'poll-vote',
      pollId,
      votes: poll.votes,
    });
  }

  private closePoll(pollId: string) {
    const poll = this.polls.get(pollId);
    if (!poll) return;

    this.polls.delete(pollId);

    this.broadcastToRoom(poll.room, {
      event: 'poll-closed',
      pollId,
      message: "Polling telah ditutup.",
      closedBy: poll.creator
    });
  }

  private clientDisconnected(username: string) {
    this.connectedClients.delete(username);
    this.broadcastUsernames();
    this.broadcastUpdateRooms();
    console.log(`Client ${username} disconnected`);
  }

  private broadcastUsernames() {
    const usernames = [...this.connectedClients.keys()];
    this.broadcast({ event: 'update-users', usernames });
    console.log("Sent username list:", JSON.stringify(usernames));
  }

  private broadcast(message: AppEvent) {
    const messageString = JSON.stringify(message);
    for (const client of this.connectedClients.values()) {
      client.send(messageString);
    }
  }

  private handleJoinRoom(socket: WebSocketWithUsername, roomName: string, password: string) {
    const room = this.rooms.find(r => r.name === roomName);
    if (!room) {
      socket.send(JSON.stringify({
        event: "join-room-failed",
        message: "Room tidak ditemukan"
      }));
      return;
    }

    if (room.private && room.password !== password) {
      socket.send(JSON.stringify({
        event: "join-room-failed",
        message: "Password salah"
      }));
      return;
    }

    this.userRooms.set(socket.username, roomName);

    socket.send(JSON.stringify({
      event: "join-room-success",
      room: roomName
    }));

    this.broadcastUpdateRooms();
  }

  private createRoom(name: string, isPrivate: boolean = false, password: string | null = null) {
    if (this.rooms.some(r => r.name === name)) return;

    this.rooms.push({ name, private: isPrivate, password: password || undefined });

    this.broadcastUpdateRooms();
  }

  private handleLeaveRoom(socket: WebSocketWithUsername) {
    this.userRooms.set(socket.username, "Global");

    socket.send(JSON.stringify({
      event: "leave-room-success"
    }));

    this.broadcastUpdateRooms();
  }

  private broadcastToRoom(room: string, message: AppEvent) {
    const messageString = JSON.stringify(message);

    for (const [username, clientSocket] of this.connectedClients.entries()) {
      const userRoom = this.userRooms.get(username) || "Global";
      if (userRoom === room) {
        clientSocket.send(messageString);
      }
    }
  }

  private broadcastUpdateRooms() {
    this.broadcast({
      event: "update-rooms",
      rooms: this.rooms.map(room => {
        const usersInRoom = [...this.userRooms.entries()]
          .filter(([_, r]) => r === room.name)
          .map(([username]) => username);

        return {
          ...room,
          users: usersInRoom
        };
      }),
    });
  }
}
