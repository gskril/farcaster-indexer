# Farcaster Indexer

Index all casts on the Farcaster protocol.

## How it works
The [Farcaster Registry](https://rinkeby.etherscan.io/address/0xe3Be01D99bAa8dB9905b33a3cA391238234B79D1) has functions `usernamesLength()` and `usernameAtIndex()`.  

This script calls `usernameAtIndex()` for each registered user according to `usernamesLength()` and returns their [host directory](https://www.farcaster.xyz/docs/host). All user directories are dumped into a MongoDB collection and updated every 2 hours.

Every 30 minutes, the addressActivityUrl within each user's directory (which contains their casts) is dumped into a separate MongoDB collection. This is what runs my [Farcaster Search API](https://github.com/gskril/farcaster-search).

**Q: Why are the two jobs separate?**  
A: Calling `usernameAtIndex()` thousands of times slows the process down significantly, so it makes sense to separate profile and cast indexing. Also, newly created accounts (within 2 hours) rarely have any content at all, so it's not critical to pick them up instantly.

**Q: Why aren't casts indexed more often?**  
A: [MongoDB Atlas](https://www.mongodb.com/atlas) takes many minutes to perform the bulk insert of all casts, and I want to make sure tasks don't overlap. This can probably be optimized (feel free to submit a PR!), and will become more important when there are significantly more casts.

**Q: Why are you replacing all casts every 30 minutes?**  
A: Currently, engagement metrics (reactions, recasts, watches) are stored in the same object as a casts's text content. So in order to keep the numbers updated, all casts need to be updated regularly.
