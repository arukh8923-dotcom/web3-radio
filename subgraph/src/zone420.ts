import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { MoodChanged, VibesEarned, JoinedZone420 } from "../generated/Zone420/Zone420";
import { MoodReaction, Listener, GlobalStats, Station } from "../generated/schema";

const MOODS = ["CHILL", "HYPE", "MELANCHOLY", "EUPHORIC", "ZEN"];

export function handleMoodChanged(event: MoodChanged): void {
  let reactionId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let reaction = new MoodReaction(reactionId);
  reaction.reactor = event.params.user;
  reaction.mood = MOODS[event.params.newMood] || "CHILL";
  reaction.vibesEarned = BigInt.fromI32(0);
  reaction.timestamp = event.block.timestamp;

  // Station is 420 zone (special frequency)
  let stationId = "420";
  let station = Station.load(stationId);
  if (!station) {
    station = new Station(stationId);
    station.frequency = BigInt.fromI32(420);
    station.owner = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
    station.name = "Zone 420";
    station.category = "420";
    station.isPremium = false;
    station.listenerCount = BigInt.fromI32(0);
    station.totalTips = BigInt.fromI32(0);
    station.signalStrength = BigInt.fromI32(100);
    station.createdAt = event.block.timestamp;
    station.updatedAt = event.block.timestamp;
    station.save();
  }
  reaction.station = station.id;
  reaction.save();
}

export function handleVibesEarned(event: VibesEarned): void {
  // Update listener vibes balance
  let listenerId = event.params.user.toHexString();
  let listener = Listener.load(listenerId);
  if (listener) {
    listener.vibesBalance = listener.vibesBalance.plus(event.params.amount);
    listener.lastActive = event.block.timestamp;
    listener.save();
  }

  // Update global stats
  let stats = GlobalStats.load("global");
  if (stats) {
    stats.totalVibesMinted = stats.totalVibesMinted.plus(event.params.amount);
    stats.save();
  }
}

export function handleJoinedZone420(event: JoinedZone420): void {
  // Get or create listener
  let listenerId = event.params.user.toHexString();
  let listener = Listener.load(listenerId);
  if (!listener) {
    listener = new Listener(listenerId);
    listener.address = event.params.user;
    listener.stations = [];
    listener.totalListeningTime = BigInt.fromI32(0);
    listener.totalTipsSent = BigInt.fromI32(0);
    listener.vibesBalance = BigInt.fromI32(0);
    listener.firstTuneIn = event.block.timestamp;
    listener.lastActive = event.block.timestamp;
    listener.save();

    // Update global stats
    let stats = GlobalStats.load("global");
    if (!stats) {
      stats = new GlobalStats("global");
      stats.totalStations = BigInt.fromI32(0);
      stats.totalListeners = BigInt.fromI32(0);
      stats.totalBroadcasts = BigInt.fromI32(0);
      stats.totalTipsVolume = BigInt.fromI32(0);
      stats.totalVibesMinted = BigInt.fromI32(0);
    }
    stats.totalListeners = stats.totalListeners.plus(BigInt.fromI32(1));
    stats.save();
  }
  listener.lastActive = event.block.timestamp;
  listener.save();
}
