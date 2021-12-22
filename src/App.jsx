import { useEffect, useMemo, useState } from 'react'
import { useWeb3 } from '@3rdweb/hooks'
import { ThirdwebSDK } from '@3rdweb/sdk'
import { ethers } from "ethers"

// init sdk and connect to our bundle module
const sdk = new ThirdwebSDK("rinkeby")
const bundleDropModule = sdk.getBundleDropModule("0x8b289FA8ba07A7715ff59C030f37d0DAB1Ef5371")
const tokenModule = sdk.getTokenModule("0xf04b71e62e39c035027132b9c6cA0458148b5aaa")
const voteModule = sdk.getVoteModule("0x3f82BFD10D8717c73cFb4A446127C5886E27A2e2")

const App = () => {
  // use the connectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3()
  console.log("Address: ", address)

  // get signer from provider for making transactions
  const signer = provider ? provider.getSigner() : undefined

  const [hasClaimed, setHasClaimed] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [memberTokens, setMemberTokens] = useState({})
  const [memberAddresses, setMemberAddresses] = useState([])
  const [proposals, setProposals] = useState([])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const shortenAddress = (str) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4)
  }


  // retrieve all existing proposals
  useEffect(() => {
    if (!hasClaimed)
      return
    
    // call to vote module to get all proposals
    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals)
      })  
      .catch((error) => {
        console.error("Could not retrieve proposals", error)
      })
  }, [hasClaimed])

  // check if user has already voted
  useEffect(() => {
    if (!hasClaimed)
      return

    // can't check if user has voted if we don't have proposals yet
    if (!proposals.length)
      return

    voteModule
      .hasVoted(proposals[0].proposalId)
  }, [hasClaimed, proposals])

  // grab members
  useEffect(() => {
    if (!hasClaimed)
      return
    
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("Members addresses", addresses)
        setMemberAddresses(addresses)
      })
      .catch((error) => {
        console.error("Failed to get member list", error)
      })
  }, [hasClaimed])

  // grab member token balances
  useEffect(() => {
    if (!hasClaimed)
      return
    
      tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("Members token amounts", amounts)
        setMemberTokens(amounts)
      })
      .catch((error) => {
        console.error("Failed to get holder balances", error)
      })
  }, [hasClaimed])

  useEffect(() => {
    // enable the signer to interact with contract
    sdk.setProviderOrSigner(signer)
  }, [signer])

  useEffect(() => {
    if (!address)
      return
    
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // if balance is greater than 0, they have the NFT
        if (balance.gt(0)) {
          setHasClaimed(true)
          console.log("User has membership NFT")
        }
        else {
          setHasClaimed(false)
          console.log("User does not have membership NFT")
        }
      })
      .catch((error) => {
        setHasClaimed(false)
        console.error("Failed to get NFT balance ", error)
      })
  }, [address])

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address, 
        tokenAmount: ethers.utils.formatUnits(memberTokens[address] || 0, 18)
      }
    })
  }, [memberAddresses, memberTokens])

  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  // if user has not connected their wallet
  if (!address) 
    return (
      <div className="landing">
        <h1>Welcome to ShouldWeGetADogDAO</h1>
        <button onClick={ () => connectWallet("injected")} className="btn-hero" >
          Connect Wallet
        </button>
      </div>
    )

  if(hasClaimed)
      return(
        <div className="member-page">
          <h1>ShouldWeGetADogDAO Member Page</h1>
          <p>Congratulations on being a member</p>
          <div>
            <div>
              <h2>Member List</h2>
              <table className="card">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Token Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map((member) => {
                    return (
                      <tr key={member.address}>
                        <td>{shortenAddress(member.address)}</td>
                        <td>{member.tokenAmount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <h2>Active Proposals</h2>
              <form
                onSubmit={ async(e) => {
                  e.preventDefault()
                  e.stopPropagation()

                  // prevent clicks while submitting
                  setIsVoting(true)

                  // get votes from form
                  const votes = proposals.map((proposal) => {
                    let voteResult = {
                      proposalId: proposal.proposalId,
                      // abstain by default
                      vote:2
                    }
                    proposal.votes.forEach((vote) => {
                      const elem = document.getElementById(proposal.proposalId + "-" + vote.type)

                      if (elem.checked) {
                        voteResult.vote = vote.type
                        return
                      }
                    })
                    return voteResult
                  })

                  // first we need user to delegate votes
                  try {
                    // check if votes are delegated
                    const delegation = await tokenModule.getDelegationOf(address)
                    // if its the 0x0 address, then votes not delegated
                    if (delegation === ethers.constants.AddressZero) {
                      // have user delegate vote
                      await tokenModule.delegateTo(address)
                    }
                    
                    // then we can have them vote
                    try {
                      await Promise.all(
                        votes.map(async(vote) => {
                          // make sure proposal is open for voting
                          const proposal = await voteModule.get(vote.proposalId)
                          // if proposal is open for voting state will === 1
                          if (proposal.state === 1) {
                            // vote!
                            return voteModule.vote(vote.proposalId, vote.vote)
                          }
                          // if not open, just return
                          return
                        })
                      )
                      
                        try {
                          // if any proposal are ready to execute, execute them
                          // proposal is ready to execute if in stage 4
                          await Promise.all(
                            votes.map(async(vote) => {
                              // check latest state
                              const proposal = await voteModule.get(vote.proposalId)
                              
                              // if ready to execute, execute the proposal
                              if (proposal.state === 4) {
                                return voteModule.execute(vote.proposalId)
                              }
                            })
                          )
                          // if we get here we successfully voted
                          setHasVoted(true)
                          console.log("Successfully voted")
                        } catch (error) {
                          console.error("failed to execute votes", error)
                        }
                    } catch (error) {
                      console.error("failed to vote", error)
                    }
                  } catch (error) {
                    console.log("failed to delegate tokens", error)
                  } finally {
                    // enable the voting button again
                    setIsVoting(false)
                  }
                }}
              >
                {proposals.map((proposal, index) => (
                  <div key={proposal.proposalId} className="card">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map((vote) => (
                        <div key={vote.type}>
                          <input 
                            type="radio"
                            id={proposal.proposalId + "-" + vote.type}
                            name={proposal.proposalId}
                            value={vote.type}
                            // default to abstain vote
                            defaultChecked={vote.type === 2}
                          />
                          <label htmlFor={proposal.proposalId + "-" + vote.type}>
                            {vote.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button disabled={isVoting || hasVoted} type="submit">
                  {isVoting
                    ? "Voting..."
                    : hasVoted
                      ? "You Already Voted"
                      : "Submit Votes"}
                </button>
                <small>
                  This will trigger multiple transactions that you will need to sign.
                </small>
              </form>
            </div>
          </div>
        </div>
      )

  const mintNFT = () => {
    setIsClaiming(true)
    // claim 1 of tokenId 0 to user's wallet
    bundleDropModule
      .claim("0", 1)
      .then( () => {
        setHasClaimed(true)
        console.log(`Successfully minted! Check it out on OpenSea https://testnets.opensea.io/assets/${bundleDropModule.address}/0`)
      })
      .catch( (error) => {
        console.error("Failed to claim", error)
      })
      .finally( () => {
        setIsClaiming(false)
      })
  }


  // if wallet is already connected
  return (
    <div className="mint-nft">
      <h1>Mint your free ShouldWeGetADogDAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={ () => mintNFT() }
      >
        {isClaiming ? "Minting" : "Mint your Free NFT"}
      </button>
    </div>
  )
}

export default App
