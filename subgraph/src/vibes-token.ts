import { BigInt } from "@graphprotocol/graph-ts";
import { Reaction, MoodRingUpdated } from "../generated/VibesToken/VibesToken";
import { MoodReaction, Station, GlobalStats } from "../generated/schema";

const MOODS = ["CHILL", "HYPE", "MELANCHOLY", "EUPHORIC", "ZEN"];

export function handleReaction(event: Reaction): void {
  let reactionId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let reaction = new MoodReaction(reactionId);
  reaction.reactor = event.params.listener;
  reaction.mood = MOODS[event.params.mood] || "CHILL";
  reaction.vibesEarned = BigInt.fromI32(10); // Default vibes earned
  reaction.timestamp = event.block.timestamp;
  reaction.save();

  // Update global stats
  let stats = GlobalStats.load("global");
  if (stats) {
    stats.totalVibesMinted = stats.totalVibesMinted.plus(BigInt.fromI32(10));
    stats.save();
  }
}

export function handleMoodRingUpdated(event: MoodRingUpdated): void {
  let stationId = event.params.frequency.toString();
  let station = Station.load(stationId);
  if (station) {
    station.updatedAt = event.block.timestamp;
    station.save();
  }
}
