import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  StationRegistered,
  TunedIn,
  TunedOut,
  SignalStrengthUpdated,
} from "../generated/RadioCoreRegistry/RadioCoreRegistry";
import { Station, Listener, GlobalStats } from "../generated/schema";

export function handleStationRegistered(event: StationRegistered): void {
  let station = new Station(event.params.station.toHexString());
  station.frequency = event.params.frequency;
  station.owner = event.params.station;
  station.name = "";
  station.category = "music";
  station.isPremium = false;
  station.listenerCount = BigInt.fromI32(0);
  station.totalTips = BigInt.fromI32(0);
  station.signalStrength = BigInt.fromI32(100);
  station.createdAt = event.block.timestamp;
  station.updatedAt = event.block.timestamp;
  station.save();

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
  stats.totalStations = stats.totalStations.plus(BigInt.fromI32(1));
  stats.save();
}

export function handleTunedIn(event: TunedIn): void {
  let listenerId = event.params.listener.toHexString();
  let listener = Listener.load(listenerId);
  
  if (!listener) {
    listener = new Listener(listenerId);
    listener.address = event.params.listener;
    listener.stations = [];
    listener.totalListeningTime = BigInt.fromI32(0);
    listener.totalTipsSent = BigInt.fromI32(0);
    listener.vibesBalance = BigInt.fromI32(0);
    listener.firstTuneIn = event.block.timestamp;
    listener.lastActive = event.block.timestamp;

    // Update global stats
    let stats = GlobalStats.load("global");
    if (stats) {
      stats.totalListeners = stats.totalListeners.plus(BigInt.fromI32(1));
      stats.save();
    }
  }
  
  listener.lastActive = event.block.timestamp;
  listener.save();

  // Update station listener count
  let stationId = event.params.frequency.toString();
  let station = Station.load(stationId);
  if (station) {
    station.listenerCount = station.listenerCount.plus(BigInt.fromI32(1));
    station.updatedAt = event.block.timestamp;
    station.save();
  }
}

export function handleTunedOut(event: TunedOut): void {
  let listenerId = event.params.listener.toHexString();
  let listener = Listener.load(listenerId);
  
  if (listener) {
    listener.lastActive = event.block.timestamp;
    listener.save();
  }

  // Update station listener count
  let stationId = event.params.frequency.toString();
  let station = Station.load(stationId);
  if (station) {
    station.listenerCount = station.listenerCount.minus(BigInt.fromI32(1));
    station.updatedAt = event.block.timestamp;
    station.save();
  }
}

export function handleSignalStrengthUpdated(event: SignalStrengthUpdated): void {
  let stationId = event.params.frequency.toString();
  let station = Station.load(stationId);
  
  if (station) {
    station.signalStrength = event.params.strength;
    station.updatedAt = event.block.timestamp;
    station.save();
  }
}
