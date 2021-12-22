import { AppModule } from "@3rdweb/sdk";
import sdk from "./1-initialize-sdk.js"

const app = sdk.getAppModule("0xcea774aA445eAae88428dBa7242f71eA91292b67");

(async () => {
    try {
        const voteModule = await app.deployVoteModule({
            // Name for Governance Contract
            name: "ShouldWeGetADogDAO Proposals",
            // governance token
            votingTokenAddress: "0xf04b71e62e39c035027132b9c6cA0458148b5aaa",
            // let members start voting immediately
            proposalStartWaitTimeInSeconds: 0,
            // how long members have to vote (24 hours or 86400 seconds)
            proposalVotingTimeInSeconds: 24 * 60 * 60,
            // minimum percentage of tokens needed to pass vote
            votingQuorumFraction: 0,
            // minimum tokens to create a proposal, set to 0 so any member can propose
            minimumNumberOfTokensNeededToPropose: "0"
        })
        console.log("Successfully deployed vote module, address:", voteModule.address)
    } catch (error) {
        console.log("failed to deploy vote module", error)
    }
})()