import sdk from "./1-initialize-sdk.js"
import { readFileSync } from "fs"

const bundleDrop = sdk.getBundleDropModule("0x8b289FA8ba07A7715ff59C030f37d0DAB1Ef5371");

(async() => {
    try {
        await bundleDrop.createBatch([
            {
                name: "CyberDog",
                description: "CyberDog NFT gives your access to participate in ShouldWeGetADogDAO!",
                image: readFileSync("scripts/assets/StylizedDog.png"),
            }
        ])
        console.log("Successfully created a new NFT in the drop!")
    } catch (error) {
        console.error("Failed to create the NFT ", error)
    }
})()