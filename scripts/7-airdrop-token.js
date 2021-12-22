import { BundleDropModule } from "@3rdweb/sdk";
import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"

const bundleDropModule = sdk.getBundleDropModule("0x8b289FA8ba07A7715ff59C030f37d0DAB1Ef5371");
const tokenModule = sdk.getTokenModule("0xf04b71e62e39c035027132b9c6cA0458148b5aaa");

(async () => {
    try {
        // grab all addresses of membership nft holders
        const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0")

        if (walletAddresses.length === 0) {
            console.log("no nfts have been claimed yet")
            process.exit(0)
        }

        // loop through the array of addresses
        const airdropTargets = walletAddresses.map((address) => {
            // pick a random number between 1000 and 10000
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
            console.log("Going to airdrop", randomAmount, "tokens to", address)

            // set up the target
            const airdropTarget = {
                address,
                // remember the 18 decimals!
                amount: ethers.utils.parseUnits(randomAmount.toString(), 18)
            }

            return airdropTarget
        })
        
        // call transferBatch to loop through all airdrop targets
        console.log("starting airdrop")
        await tokenModule.transferBatch(airdropTargets)
        console.log("Successfully airdropped tokens to all holders")
    } catch (error) {
        console.error("Failed to airdrop tokens", error)
    }
})()