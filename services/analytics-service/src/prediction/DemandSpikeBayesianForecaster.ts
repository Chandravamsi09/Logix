/**
 * Bayesian Prior-Posterior Demand Spike Probability Model
 * Computes posterior probability of supply chain stockouts given historical promotional surges.
 */

export class DemandSpikeBayesianForecaster {
  public calculatePosteriorSpikeProbability(
    priorSpikeProb: number,
    likelihoodGivenPromo: number,
    likelihoodGivenNoPromo: number,
    isPromoActive: boolean
  ): number {
    if (!isPromoActive) return priorSpikeProb;

    const numerator = likelihoodGivenPromo * priorSpikeProb;
    const denominator = (likelihoodGivenPromo * priorSpikeProb) + (likelihoodGivenNoPromo * (1 - priorSpikeProb));

    return +(numerator / (denominator || 1)).toFixed(4);
  }
}
