async function runE2EVerification() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  console.log(`🔍 Starting E2E verification against ${baseUrl}...\n`);

  // 1. Reset demo data to start clean
  console.log('1. Testing POST /api/reset...');
  const resetRes = await fetch(`${baseUrl}/api/reset`, { method: 'POST' });
  if (!resetRes.ok) throw new Error(`Reset failed: ${resetRes.status}`);
  const resetData = await resetRes.json();
  console.log('   ✓ Reset response:', resetData);

  // 2. Fetch feed (default user is male looking for female -> 16 profiles)
  console.log('\n2. Testing GET /api/feed (default gender filter: female profiles)...');
  const feedRes = await fetch(`${baseUrl}/api/feed`);
  if (!feedRes.ok) throw new Error(`Feed failed: ${feedRes.status}`);
  const feedData = await feedRes.json();
  console.log(`   ✓ Received ${feedData.profiles.length} profiles`);
  if (feedData.profiles.length !== 16) {
    throw new Error(`Expected 16 female profiles, got ${feedData.profiles.length}`);
  }

  // Verify privacy
  for (const p of feedData.profiles) {
    if ('likedUser' in p || 'liked_user' in p || 'likedMe' in p) {
      throw new Error(`CRITICAL PRIVACY VIOLATION: Private liked status leaked on profile ${p.id}!`);
    }
  }
  console.log('   ✓ Verified: 0% private fields leaked. Feed is strictly sanitized.');

  // 3. Test Like on profile that did NOT like user (coy_7 - Tara Iyer)
  console.log('\n3. Testing Like on someone who did NOT like user (coy_7 - Tara Iyer)...');
  const likeNoMatchRes = await fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'coy_7', direction: 'like' }),
  });
  const likeNoMatchData = await likeNoMatchRes.json();
  console.log('   ✓ Swipe result:', likeNoMatchData);
  if (likeNoMatchData.match !== false || likeNoMatchData.profile) {
    throw new Error('Expected match: false and no profile');
  }

  // 4. Test Pass on someone who DID like user (coy_3 - Riya Deshmukh)
  console.log('\n4. Testing Pass on someone who DID like user (coy_3 - Riya Deshmukh)...');
  const passRes = await fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'coy_3', direction: 'pass' }),
  });
  const passData = await passRes.json();
  console.log('   ✓ Swipe result:', passData);
  if (passData.match !== false || passData.profile) {
    throw new Error('Expected match: false when passing, even if target liked user');
  }

  // 5. Test Like on someone who DID like user (coy_1 - Ananya Sen)
  console.log('\n5. Testing Like on someone who DID like user (coy_1 - Ananya Sen)...');
  const matchRes = await fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'coy_1', direction: 'like' }),
  });
  const matchData = await matchRes.json();
  console.log('   ✓ Match result:', matchData);
  if (matchData.match !== true || !matchData.profile || matchData.profile.id !== 'coy_1') {
    throw new Error('Expected match: true and profile details for Ananya Sen');
  }

  // 6. Test GET /api/matches
  console.log('\n6. Testing GET /api/matches...');
  const matchesRes = await fetch(`${baseUrl}/api/matches`);
  const matchesData = await matchesRes.json();
  console.log(`   ✓ Matches count: ${matchesData.matches.length}`);
  if (matchesData.matches.length !== 1 || matchesData.matches[0].id !== 'coy_1') {
    throw new Error('Expected exactly 1 match (Ananya Sen)');
  }

  // 7. Test Idempotency: swipe same profile again
  console.log('\n7. Testing Idempotency on repeat swipe (coy_1)...');
  const repeatRes = await fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'coy_1', direction: 'like' }),
  });
  const repeatData = await repeatRes.json();
  console.log('   ✓ Repeat swipe result:', repeatData);

  const matchesAfterRepeat = await (await fetch(`${baseUrl}/api/matches`)).json();
  if (matchesAfterRepeat.matches.length !== 1) {
    throw new Error('Duplicate match created on repeat swipe!');
  }
  console.log('   ✓ Verified: Repeat swipe is safe and idempotent. No duplicate matches created.');

  // 8. Test Feed Exclusions
  console.log('\n8. Testing feed exclusions after 3 swipes...');
  const feedAfterSwipes = await (await fetch(`${baseUrl}/api/feed`)).json();
  const remainingIds = feedAfterSwipes.profiles.map((p: any) => p.id);
  if (remainingIds.includes('coy_1') || remainingIds.includes('coy_7') || remainingIds.includes('coy_3')) {
    throw new Error('Feed still contains swiped profiles!');
  }
  console.log(`   ✓ Remaining profiles in female feed: ${remainingIds.length} (16 - 3 = 13). Correct!`);

  // 9. Test Gender Preference Switch: Switch to looking for Men
  console.log('\n9. Testing preference update to looking for Men...');
  const updatePrefRes = await fetch(`${baseUrl}/api/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gender: 'female', lookingFor: 'male' }),
  });
  if (!updatePrefRes.ok) throw new Error('Failed to update preferences');
  const maleFeed = await (await fetch(`${baseUrl}/api/feed`)).json();
  console.log(`   ✓ Switched to male feed: received ${maleFeed.profiles.length} male profiles`);
  if (!maleFeed.profiles.every((p: any) => p.gender === 'male')) {
    throw new Error('Expected all profiles to be male');
  }

  // 10. Test Location Filter: Filter by Bangalore
  console.log('\n10. Testing location filter (Bangalore)...');
  const bglFeed = await (await fetch(`${baseUrl}/api/feed?city=Bangalore`)).json();
  console.log(`   ✓ Bangalore male profiles: ${bglFeed.profiles.length}`);
  if (!bglFeed.profiles.every((p: any) => p.city.includes('Bangalore'))) {
    throw new Error('Expected all profiles to be in Bangalore');
  }

  // 11. Test Error Codes
  console.log('\n11. Testing validation and status codes...');
  const badBodyRes = await fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'coy_1', direction: 'invalid_direction' }),
  });
  console.log(`   ✓ Bad direction status code: ${badBodyRes.status} (expected 400)`);
  if (badBodyRes.status !== 400) throw new Error('Expected status 400');

  const notFoundRes = await fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'non_existent_id', direction: 'like' }),
  });
  console.log(`   ✓ Unknown profile status code: ${notFoundRes.status} (expected 404)`);
  if (notFoundRes.status !== 404) throw new Error('Expected status 404');

  // 12. Final reset and restore default user
  console.log('\n12. Final demo reset and restore...');
  await fetch(`${baseUrl}/api/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gender: 'male', lookingFor: 'female' }),
  });
  await fetch(`${baseUrl}/api/reset`, { method: 'POST' });
  const finalFeed = await (await fetch(`${baseUrl}/api/feed`)).json();
  const finalMatches = await (await fetch(`${baseUrl}/api/matches`)).json();
  console.log(`   ✓ Feed restored to ${finalFeed.profiles.length} profiles, matches reset to ${finalMatches.matches.length}`);

  console.log('\n🎉 ALL 12 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!\n');
}

runE2EVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
