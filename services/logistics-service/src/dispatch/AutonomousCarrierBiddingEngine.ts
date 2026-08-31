/**
 * Real-Time Autonomous Spot Freight Carrier Bidding Engine
 * Coordinates reverse spot auction rounds, carrier bid ranking, and auto-tendering to lowest qualified carrier.
 */

export interface ISpotAuction {
  auctionId: string;
  shipmentId: string;
  originPostalCode: string;
  destinationPostalCode: string;
  equipmentType: 'DRY_VAN_53' | 'REEFER_53' | 'FLATBED' | 'STEP_DECK';
  maxCeilingRateUSD: number;
  auctionOpensAt: Date;
  auctionClosesAt: Date;
  status: 'OPEN' | 'AWARDED' | 'EXPIRED' | 'CANCELLED';
  bids: Array<{
    bidId: string;
    carrierId: string;
    bidAmountUSD: number;
    estimatedPickupAt: Date;
    carrierSafetyScore: number;
    submittedAt: Date;
  }>;
  winningBidId?: string;
}

export class AutonomousCarrierBiddingEngine {
  private readonly auctions = new Map<string, ISpotAuction>();

  public createSpotAuction(
    shipmentId: string,
    origin: string,
    destination: string,
    equipment: ISpotAuction['equipmentType'],
    ceilingRate: number,
    durationMinutes: number = 30
  ): ISpotAuction {
    const auctionId = 'AUC-' + Date.now().toString(36).toUpperCase();
    const now = new Date();
    const auction: ISpotAuction = {
      auctionId,
      shipmentId,
      originPostalCode: origin,
      destinationPostalCode: destination,
      equipmentType: equipment,
      maxCeilingRateUSD: ceilingRate,
      auctionOpensAt: now,
      auctionClosesAt: new Date(now.getTime() + durationMinutes * 60000),
      status: 'OPEN',
      bids: []
    };

    this.auctions.set(auctionId, auction);
    return auction;
  }

  public submitBid(
    auctionId: string,
    carrierId: string,
    bidAmountUSD: number,
    estimatedPickupAt: Date,
    carrierSafetyScore: number
  ): { isAccepted: boolean; rank: number; message: string } {
    const auction = this.auctions.get(auctionId);
    if (!auction) return { isAccepted: false, rank: 0, message: 'Auction does not exist' };
    if (auction.status !== 'OPEN' || auction.auctionClosesAt < new Date()) {
      return { isAccepted: false, rank: 0, message: 'Auction is closed' };
    }
    if (bidAmountUSD > auction.maxCeilingRateUSD) {
      return { isAccepted: false, rank: 0, message: 'Bid exceeds maximum ceiling price' };
    }

    const bidId = 'BID-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4);
    auction.bids.push({
      bidId,
      carrierId,
      bidAmountUSD,
      estimatedPickupAt,
      carrierSafetyScore,
      submittedAt: new Date()
    });

    // Rank bids ascending by price with safety score tie-breaker
    auction.bids.sort((a, b) => a.bidAmountUSD - b.bidAmountUSD || b.carrierSafetyScore - a.carrierSafetyScore);
    const rank = auction.bids.findIndex(b => b.bidId === bidId) + 1;

    return {
      isAccepted: true,
      rank,
      message: 'Bid successfully placed'
    };
  }

  public awardAuction(auctionId: string): { winningBidId: string; winningCarrierId: string; agreedRateUSD: number } {
    const auction = this.auctions.get(auctionId);
    if (!auction || !auction.bids.length) {
      throw new Error('Cannot award auction: No valid bids received');
    }

    const winner = auction.bids[0];
    auction.status = 'AWARDED';
    auction.winningBidId = winner.bidId;

    return {
      winningBidId: winner.bidId,
      winningCarrierId: winner.carrierId,
      agreedRateUSD: winner.bidAmountUSD
    };
  }
}
