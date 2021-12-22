import sdk from "./1-initialize-sdk.js"

const app = sdk.getAppModule("0xcea774aA445eAae88428dBa7242f71eA91292b67");

(async () => {
    try {
        const tokenModule = await app.deployTokenModule({
            name: "ShouldWeGetADogDAO Governance Token",
            symbol: "GETDOG"
        })
        console.log("Successfully deployed token module, address: ", tokenModule.address)
    } catch (error) {
        console.error("failed to deploy token module ", error)
    }
})()