import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule("0xf04b71e62e39c035027132b9c6cA0458148b5aaa");

(async() => {
    try {
        console.log("Roles that exist right now: ", await tokenModule.getAllRoleMembers())

        // revoke superpowers
        await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS)
        console.log("Roles after revoking: ", await tokenModule.getAllRoleMembers())
        console.log("Successfully revoked privileges")
    } catch (error) {
        console.error("could not revoke access ", error)
    }
})()