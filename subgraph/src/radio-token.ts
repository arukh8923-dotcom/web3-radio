import { BigInt } from "@graphprotocol/graph-ts";
import { Tipped, Subscribed } from "../generated/RadioToken/RadioToken";
import { Tip, Subscription, Listener, Station, GlobalStats } from "../generated/schema";

export function handleTipped(event: Tipped): void {
  let tipId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let tip = new Tip(tipId);
  tip.from = event.params.from;
  tip.to = event.params.to;
  tip.amount = event.params.amount;
  tip.timestamp = event.block.timestamp;
  tip.txHash = event.transaction.hash;
  tip.save();

  // Update listener stats
  let listenerId = event.params.from.toHexString();
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

export function handleSubscribed(event: Subscribed): void {
  let subId = event.params.listener.toHexString() + "-" + event.params.frequency.toString();
  let subscription = new Subscription(subId);
  subscription.startTime = event.block.timestamp;
  subscription.endTime = event.params.expiry;
  subscription.isActive = true;
  subscription.save();
}
