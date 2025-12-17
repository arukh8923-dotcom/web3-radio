import { BigInt } from "@graphprotocol/graph-ts";
import { SessionCreated, SessionNFTClaimed, SessionClosed } from "../generated/SessionNFTFactory/SessionNFTFactory";
import { Session, SessionNFT } from "../generated/schema";

export function handleSessionCreated(event: SessionCreated): void {
  let session = new Session(event.params.sessionId.toString());
  session.frequency = event.params.frequency;
  session.startTime = event.block.timestamp;
  session.endTime = BigInt.fromI32(0);
  session.attendeeCount = BigInt.fromI32(0);
  session.mintingClosed = false;
  session.save();
}

export function handleSessionNFTClaimed(event: SessionNFTClaimed): void {
  let nftId = event.params.sessionId.toString() + "-" + event.params.attendee.toHexString();
  let nft = new SessionNFT(nftId);
  nft.tokenId = event.params.sessionId;
  nft.attendee = event.params.attendee;
  nft.mintedAt = event.block.timestamp;
  nft.save();

  // Update session attendee count
  let session = Session.load(event.params.sessionId.toString());
  if (session) {
    session.attendeeCount = session.attendeeCount.plus(BigInt.fromI32(1));
    session.save();
  }
}

export function handleSessionClosed(event: SessionClosed): void {
  let session = Session.load(event.params.sessionId.toString());
  if (session) {
    session.endTime = event.block.timestamp;
    session.attendeeCount = event.params.attendeeCount;
    session.mintingClosed = true;
    session.save();
  }
}
