require('dotenv').config()
const got = require('got')
const cron = require('node-cron')
const { providers, Contract, utils } = require('ethers')
const { MongoClient, ServerApiVersion } = require('mongodb')

const client = new MongoClient(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
})

function indexCasts() {
	client.connect(async (err) => {
		if (err) {
			console.error('Error connecting to MongoDB.', err)
			return
		}

		const startTime = Date.now()
		const db = client.db('farcaster')
		const oldConnection = db.collection('casts')
		const newCollection = db.collection('casts_temp')

		// If the temp table already exists, drop it
		try {
			await newCollection.drop()
		} catch {}

		// Avoid indexing duplicate casts
		await newCollection.createIndex({ merkleRoot: 1 }, { unique: true })

		const provider = new providers.AlchemyProvider(
			'rinkeby',
			process.env.ALCHEMY_SECRET
		)

		const registryContract = new Contract(
			'0xe3Be01D99bAa8dB9905b33a3cA391238234B79D1',
			require('./registry-abi.js'),
			provider
		)

		let usersIndexed = 0
		const numberOfUsers = await registryContract
			.usernamesLength()
			.catch(() => {
				console.error('Error getting number of users from contract')
				return 0
			})

		if (numberOfUsers === 0) {
			return
		} else {
			console.log(`Indexing ${numberOfUsers} users...`)
		}

		for (let i = 0; i < numberOfUsers; i++) {
			const byte32Name = await registryContract
				.usernameAtIndex(i)
				.catch(() => {
					console.log(`Could not get username at index ${i}`)
					return null
				})

			if (!byte32Name) continue

			const username = utils.parseBytes32String(byte32Name)

			// Skip test accounts
			if (username.startsWith('__tt__')) continue

			const directoryUrl = await registryContract
				.getDirectoryUrl(byte32Name)
				.catch(() => {
					console.log(`Could not get directory url for ${username}`)
					return null
				})

			if (!directoryUrl) continue

			try {
				const activityUrl = await got(directoryUrl)
					.json()
					.then((res) => res.body)
					.then((res) => res.addressActivityUrl)

				const activity = await got(activityUrl).json()

				if (activity.length > 0) {
					await newCollection
						.insertMany(activity)
						.then(() => usersIndexed++)
						.catch((err) => {
							console.log(
								`Error saving ${username}'s casts.`,
								err.message
							)
						})
				}
			} catch (err) {
				// Ignore issues with testing accounts
				if (!directoryUrl.includes('localhost')) {
					// console.log(`Unable to get ${username}'s activity at directory ${directoryUrl}`)
				}
			}
		}

		// Replace existing collection with new casts
		try {
			await oldConnection.drop()
		} catch (err) {
			console.log('Error dropping collection.', err.codeName)
		}
		await newCollection.rename('casts')

		client.close()
		const endTime = Date.now()
		const secondsTaken = (endTime - startTime) / 1000
		console.log(`Indexed ${usersIndexed} users in ${secondsTaken} seconds`)
	})
}

// Run job every hour
cron.schedule('0 */1 * * *', async () => {
	indexCasts()
})
