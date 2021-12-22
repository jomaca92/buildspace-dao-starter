import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"
import { readFileSync } from "fs"

const app = sdk.getAppModule("0xcea774aA445eAae88428dBa7242f71eA91292b67");

(async () => {
    try {
        const bundleDropModule = await app.deployBundleDropModule({
            // collection name
            name: "ShouldWeGetADogDAO",
            // collection description
            description: "My wife wants a dog and I'm on the fence, letting the internet decide.", 
            // image for collection that will show on opensea
            image: readFileSync("scripts/assets/dog.png"),
            // pass in address of receiver of sales proceeds
            // in this case null address because it will be free
            primarySaleRecipientAddress: ethers.constants.AddressZero,
        })
        console.log("Successfully deployed bundleDrop module, address: " , bundleDropModule.address)
        console.log("bundleDrop metadata: ", await bundleDropModule.getMetadata())
    } catch (error) {
        console.log("Failed to deploy bundleDrop module ", error)
    }
})()