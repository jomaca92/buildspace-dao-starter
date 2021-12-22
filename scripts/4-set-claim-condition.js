import sdk from "./1-initialize-sdk.js"

const bundleDrop = sdk.getBundleDropModule("0x8b289FA8ba07A7715ff59C030f37d0DAB1Ef5371");

(async () => {
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory()

        // specify claim conditions
        claimConditionFactory.newClaimPhase({
            startTime: new Date(),
            maxQuantity: 10_000,
            maxQuantityPerTransaction: 1
        })

        await bundleDrop.setClaimCondition(0, claimConditionFactory)
        console.log("Successfully set claim condition!")
    } catch (error) {
        console.error("Failed to set a claim condition ", error)
    }
})()