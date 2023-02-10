import got from 'got'

import { MERKLE_REQUEST_OPTIONS } from '../merkle.js'
import supabase from '../supabase.js'
import { FlattenedProfile, MerkleResponse, Profile } from '../types/index.js'
import { breakIntoChunks } from '../utils.js'

/**
 * Reformat and upsert all profiles into the database
 */
export async function updateAllProfiles() {
  const startTime = Date.now()
  const allProfiles = await getAllProfiles()

  const formattedProfiles: FlattenedProfile[] = allProfiles.map((p) => {
    return {
      id: p.fid,
      username: p.username,
      display_name: p.displayName || null,
      avatar_url: p.pfp?.url || null,
      avatar_verified: p.pfp?.verified || false,
      followers: p.followerCount,
      following: p.followingCount,
      bio: p.profile?.bio?.text || null,
      referrer: p?.referrerUsername || null,
      updated_at: new Date(),
      follower_fids: p?.followerFids || null,
      follower_fnames: p?.followerFnames || null,
      following_fids: p?.followingFids || null,
      following_fnames: p?.followingFnames || null,
    }
  })

  // Upsert profiles in chunks to avoid locking the table
  const chunks = breakIntoChunks(formattedProfiles, 500)
  for (const chunk of chunks) {
    const { error } = await supabase
      .from('profile')
      .upsert(chunk, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000

  if (duration > 60) {
    // If it takes more than 60 seconds, log the duration so we can optimize
    console.log(`Updated ${allProfiles.length} profiles in ${duration} seconds`)
  }
}

/**
 * Get all profiles from the Merkle API
 * @returns An array of all Farcaster profiles
 */
async function getAllProfiles(): Promise<Profile[]> {
  const allProfiles: Profile[] = new Array()
  let endpoint = buildProfileEndpoint()

  while (true) {
    const _response = await got(endpoint, MERKLE_REQUEST_OPTIONS).json()

    const response = _response as MerkleResponse
    const profiles = response.result.users

    if (!profiles) throw new Error('No profiles found')

    for (const profile of profiles) {
      const followerFids: number[] = new Array();
      const followerFnames: string[] = new Array();
      let followersEndpoint = buildFollowersEndpoint(profile.fid);

      const followingFids: number[] = new Array();
      const followingFnames: string[] = new Array();
      let followingEndpoint = buildFollowingEndpoint(profile.fid);

      while (true) {
        const _followersRes = await got(followersEndpoint, MERKLE_REQUEST_OPTIONS).json();
        const followersRes = _followersRes as MerkleResponse;
        const followers = followersRes.result.users;

        const _followingRes = await got(followingEndpoint, MERKLE_REQUEST_OPTIONS).json();
        const followingRes = _followingRes as MerkleResponse;
        const following = followingRes.result.users;

        if (!followers) throw new Error('No followers found');
        for (const follower of followers) {
          followerFids.push(follower.fid);
          followerFnames.push(follower.username);
        }

        if (!following) throw new Error('No follows found');
        for (const follower of following) {
          followingFids.push(follower.fid);
          followingFnames.push(follower.username);
        }

        // If there are more followers, get the next page.
        const followersCursor = followersRes.next?.cursor;
        if (followersCursor) {
          followersEndpoint = buildFollowersEndpoint(profile.fid, followersCursor);
        } else break;

        const followingCursor = followingRes.next?.cursor;
        if (followingCursor) {
          followingEndpoint = buildFollowingEndpoint(profile.fid, followingCursor);
        } else break;
      }

      const extendedProfile: Profile = {
        ...profile,
        followerFids,
        followerFnames,
        followingFids,
        followingFnames,
      }

      allProfiles.push(extendedProfile);
    }

    // If there are more profiles, get the next page
    const cursor = response.next?.cursor
    if (cursor) {
      endpoint = buildProfileEndpoint(cursor)
    } else {
      break
    }
  }

  return allProfiles as Profile[]
}

/**
 * Helper function to build the profile endpoint with a cursor
 * @param cursor
 */
function buildProfileEndpoint(cursor?: string): string {
  return `https://api.farcaster.xyz/v2/recent-users?limit=1000${
    cursor ? `&cursor=${cursor}` : ''
  }`
}

/**
 * Helper function to build the endpoint that returns a list of users who follow user of this FId.
 * @param cursor
 * @param fid
 */
function buildFollowersEndpoint(fid: number, cursor?: string): string {
  return `https://api.farcaster.xyz/v2/followers?fid=${fid}&limit=1000${
    cursor ? `&cursor=${cursor}` : ''
  }`
}

/**
 * Helper function to build the endpoint that returns a list of users that this FId follows.
 * @param cursor
 * @param fid
 */
function buildFollowingEndpoint(fid: number, cursor?: string): string {
  return `https://api.farcaster.xyz/v2/following?fid=${fid}&limit=1000${
    cursor ? `&cursor=${cursor}` : ''
  }`
}
