import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  SessionCreated,
  AttendeeJoined,
  SessionEnded,
} from "../generated/SessionNFTFactory/SessionNFTFactory";
import { Session, SessionNFT, Station } from "../generated/schema";

export function handleSessionCreated(event: SessionCreated): void {
  let session = new Session(event.params.sessionId.toString());
  session.frequency = event.params.frequency;
  session.startTime = event.block.timestamp;
  session.endTime = BigInt.fromI32(0);
  session.attendeeCount = BigInt.fromI32(0);
  session.mintingClosed = false;

  // Get or create station by frequency
  let stationId = event.params.frequency.toString();
  let station = Station.load(stationId);
  if (!station) {
    station = new Station(stationId);
    station.frequency = event.params.frequency;
    station.owner = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
    station.name = "Station " + stationId;
    station.category = "music";
    station.isPremium = false;
    station.listenerCount = BigInt.fromI32(0);
    station.totalTips = BigInt.fromI32(0);
    station.signalStrength = BigInt.fromI32(100);
    station.createdAt = event.block.timestamp;
    station.updatedAt = event.block.timestamp;
    station.save();
  }
  session.station = station.id;

  // DJ/Host is from event params
  session.dj = event.params.host;
  session.save();
}

export function handleAttendeeJoined(event: AttendeeJoined): void {
  // Update session attendee count
  let session = Session.load(event.params.sessionId.toString());
  if (session) {
    session.attendeeCount = session.attendeeCount.plus(BigInt.fromI32(1));
    session.save();
  }
}

export function handleSessionEnded(event: SessionEnded): void {
  let session = Session.load(event.params.sessionId.toString());
  if (session) {
    session.endTime = event.block.timestamp;
    session.attendeeCount = event.params.attendeeCount;
    session.mintingClosed = true;
    session.save();
  }
}
