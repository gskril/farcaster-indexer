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

client.connect((err) => {
	if (err) {
		console.error(err)
		return
	}
})

const provider = new providers.AlchemyProvider(
	'rinkeby',
	process.env.ALCHEMY_SECRET
)

const registryContract = new Contract(
	'0xe3Be01D99bAa8dB9905b33a3cA391238234B79D1',
	require('./registry-abi.js'),
	provider
)

async function indexCasts() {
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

	const allCasts = []
	let profilesIndexed = 0
	const profiles = await db
		.collection('profiles')
		.find({})
		.toArray()
		.catch(() => {
			console.error('Error getting number of profiles from MongoDB')
			return null
		})

	if (!profiles) return
	console.log(`Indexing casts from ${profiles.length} profiles...`)

	for (let i = 0; i < profiles.length; i++) {
		const profile = profiles[i]
		const name = profile.body.displayName

		const activity = await got(profile.body.addressActivityUrl)
			.json()
			.catch(() => {
				console.log(`Could not get activity for ${name}`)
				return null
			})

		if (!activity) continue
		allCasts.push(...activity)
		profilesIndexed++
	}

	await newCollection.insertMany(allCasts).catch((err) => {
		console.log(`Error saving casts to MongoDB.`, err.message)
	})

	// Replace existing collection with new casts
	try {
		await oldConnection.drop()
	} catch (err) {
		console.log('Error dropping collection.', err.codeName)
	}
	await newCollection.rename('casts')

	const endTime = Date.now()
	const secondsTaken = (endTime - startTime) / 1000
	console.log(
		`Saved ${allCasts.length} casts from ${profilesIndexed} profiles in ${secondsTaken} seconds`
	)
}

async function indexProfiles() {
	const startTime = Date.now()
	const db = client.db('farcaster')
	const oldConnection = db.collection('profiles')
	const newCollection = db.collection('profiles_temp')

	// If the temp table already exists, drop it
	try {
		await newCollection.drop()
	} catch {}

	// Avoid indexing duplicate profiles
	await newCollection.createIndex({ merkleRoot: 1 }, { unique: true })

	let profilesIndexed = 0
	const numberOfProfiles = await registryContract
		.usernamesLength()
		.catch(() => {
			console.error('Error getting number of profiles from contract')
			return 0
		})

	if (numberOfProfiles === 0) return
	console.log(`Indexing ${numberOfProfiles} profiles...`)

	for (let i = 0; i < numberOfProfiles; i++) {
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

		if (!directoryUrl || directoryUrl.includes('localhost')) continue

		try {
			const directory = await got(directoryUrl)
				.json()
				.then((res) => {
					res.index = i
					return res
				})

			await newCollection
				.insertOne(directory)
				.then(() => profilesIndexed++)
				.catch((err) => {
					console.log(
						`Error saving ${username}'s directory.`,
						err.message
					)
				})
		} catch (err) {
			// console.log(`Unable to get ${username}'s directory`)
		}
	}

	// Replace existing collection with new one
	try {
		await oldConnection.drop()
	} catch (err) {
		console.log('Error dropping collection.', err.codeName)
	}
	await newCollection.rename('profiles')

	const endTime = Date.now()
	const secondsTaken = (endTime - startTime) / 1000
	console.log(
		`Indexed ${profilesIndexed} directories in ${secondsTaken} seconds`
	)
}

// Run job every 2 hours
cron.schedule('0 */2 * * *', () => {
	indexProfiles()
})

// Run job 30 mins
cron.schedule('*/30 * * * *', () => {
	indexCasts()
})
