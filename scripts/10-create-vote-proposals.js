import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"

const voteModule = sdk.getVoteModule("0x3f82BFD10D8717c73cFb4A446127C5886E27A2e2");
const tokenModule = sdk.getTokenModule("0xf04b71e62e39c035027132b9c6cA0458148b5aaa");

// (async () => {
//     try {
//         const amount = 696_969
//         await voteModule.propose(
//             "Should the DAO mint an additional " + amount + " tokens into the treasury?",
//             [
//                 {
//                     // set native token value (ETH) to 0 - we are dealing with our governance token
//                     nativeTokenValue: 0,
//                     transactionData: tokenModule.contract.interface.encodeFunctionData(
//                         // minting to vote module (treasury)
//                         "mint",
//                         [
//                             voteModule.address,
//                             ethers.utils.parseUnits(amount.toString(), 18)
//                         ]
//                     ),
//                     // token module that executes the mint
//                     toAddress: tokenModule.address
//                 }
//             ]
//         )

//         console.log("✅ Successfully created proposal to mint tokens")
//     } catch (error) {
//         console.error("failed to create the first proposal", error)
//         process.exit(1)
//     }
// })();

(async() => {
    try {
        const amount = 100_000;
        // Create proposal to transfer ourselves 100000 tokens
        await voteModule.propose(
            "Should the DAO transfer " +
            amount + " tokens from the treasury to my wife (" +
            process.env.WALLET_ADDRESS_2 + ") in order to give her a larger share than me in the DAO (and we would therefore have to get the dog).",
            [
                {
                // sending 0 ETH - just sending governance token
                nativeTokenValue: 0,
                transactionData: tokenModule.contract.interface.encodeFunctionData(
                    // transfer from the treasury to second wallet.
                    "transfer",
                    [
                    process.env.WALLET_ADDRESS_2,
                    ethers.utils.parseUnits(amount.toString(), 18),
                    ]
                ),

                toAddress: tokenModule.address,
                },
            ]
        );

        console.log("Successfully created second proposal!");
    } catch (error) {
        console.error("failed to create second proposal", error);
    }
})();