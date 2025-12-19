import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  TipSent,
  SubscriptionCreated,
} from "../generated/SubscriptionManager/SubscriptionManager";
import { Tip, StationSubscription, Listener, Station, GlobalStats } from "../generated/schema";

export function handleTipSent(event: TipSent): void {
  let tipId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let tip = new Tip(tipId);
  tip.from = event.params.tipper;
  tip.to = event.params.dj;
  tip.amount = event.params.amount;
  tip.timestamp = event.block.timestamp;
  tip.txHash = event.transaction.hash;

  // Get or create station
  let stationId = event.params.station.toHexString();
  let station = Station.load(stationId);
  if (!station) {
    station = new Station(stationId);
    station.frequency = BigInt.fromI32(0);
    station.owner = event.params.station;
    station.name = "Station";
    station.category = "music";
    station.isPremium = false;
    station.listenerCount = BigInt.fromI32(0);
    station.totalTips = BigInt.fromI32(0);
    station.signalStrength = BigInt.fromI32(100);
    station.createdAt = event.block.timestamp;
    station.updatedAt = event.block.timestamp;
    station.save();
  }
  station.totalTips = station.totalTips.plus(event.params.amount);
  station.updatedAt = event.block.timestamp;
  station.save();

  tip.station = station.id;
  tip.save();

  // Update listener stats
  let listenerId = event.params.tipper.toHexString();
  let listener = Listener.load(listenerId);
  if (listener) {
    listener.totalTipsSent = listener.totalTipsSent.plus(event.params.amount);
    listener.lastActive = event.block.timestamp;
    listener.save();
  }

  // Update global stats
  let stats = GlobalStats.load("global");
  if (stats) {
    stats.totalTipsVolume = stats.totalTipsVolume.plus(event.params.amount);
    stats.save();
  }
}

export function handleSubscriptionCreated(event: SubscriptionCreated): void {
  let subId = event.params.subscriber.toHexString() + "-" + event.params.station.toHexString();
  let subscription = new StationSubscription(subId);

  // Get or create listener
  let listenerId = event.params.subscriber.toHexString();
  let listener = Listener.load(listenerId);
  if (!listener) {
    listener = new Listener(listenerId);
    listener.address = event.params.subscriber;
    listener.stations = [];
    listener.totalListeningTime = BigInt.fromI32(0);
    listener.totalTipsSent = BigInt.fromI32(0);
    listener.vibesBalance = BigInt.fromI32(0);
    listener.firstTuneIn = event.block.timestamp;
    listener.lastActive = event.block.timestamp;
    listener.save();
  }
  subscription.listener = listener.id;

  // Get or create station
  let stationId = event.params.station.toHexString();
  let station = Station.load(stationId);
  if (!station) {
    station = new Station(stationId);
    station.frequency = BigInt.fromI32(0);
    station.owner = event.params.station;
    station.name = "Station";
    station.category = "music";
    station.isPremium = false;
    station.listenerCount = BigInt.fromI32(0);
    station.totalTips = BigInt.fromI32(0);
    station.signalStrength = BigInt.fromI32(100);
    station.createdAt = event.block.timestamp;
    station.updatedAt = event.block.timestamp;
    station.save();
  }
  subscription.station = station.id;

  subscription.startTime = event.block.timestamp;
  subscription.endTime = event.params.endTime;
  subscription.amount = event.params.amount;
  subscription.isActive = true;
  subscription.save();
}
