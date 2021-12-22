import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"

const tokenModule = sdk.getTokenModule("0xf04b71e62e39c035027132b9c6cA0458148b5aaa");

(async () => {
    try {
        // max supply
        const amount = 1_000_000

        // convert this amount to have 18 decimals
        const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), 18)

        // update contract
        await tokenModule.mint(amountWithDecimals)
        const totalSupply = await tokenModule.totalSupply()

        // print total amount of tokens
        console.log("There now is ", ethers.utils.formatUnits(totalSupply, 18), " $GETDOG in circulation")
    } catch (error) {
        console.error("Failed to mint supply ", error)
    }
})()