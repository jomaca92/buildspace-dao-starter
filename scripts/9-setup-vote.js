import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"

const voteModule = sdk.getVoteModule("0x3f82BFD10D8717c73cFb4A446127C5886E27A2e2");
const tokenModule = sdk.getTokenModule("0xf04b71e62e39c035027132b9c6cA0458148b5aaa");

// (async () => {
//     try {
//         // give treasury the power to mint additional tokens if needed
//         await tokenModule.grantRole("minter", voteModule.address)
//         console.log("Successfully gave vote module permissions to act on token module")
//     } catch (error) {
//         console.error("could not grant treasury permissions", error)
//     }
// })();

(async() => {
    try {
        const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS)

        // grab 90% of supply that we hold
        const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value)
        const percent90 = ownedAmount.div(100).mul(90) 
         
        // transfer the 90% to the vote module
        await tokenModule.transfer(voteModule.address, percent90)

        console.log("successfully transferred tokens to vote module")
    } catch (error) {
        console.error("failed to transfer tokens to vote module", error)
    }
})();