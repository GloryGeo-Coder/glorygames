import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_CATALOG } from '../../apps/web/src/lib/gameCatalog.ts';
import { selectRelated } from '../../apps/web/src/lib/relatedGames.ts';
const games = Object.entries(GAME_CATALOG).map(([slug, entry]) => ({slug,...entry}));
test('every public game has four distinct neighbors and at least one incoming guide link', () => {
  const incoming = new Set();
  for (const game of games) {
    const picks = selectRelated(game.slug,game.category,games).map(item=>item.slug);
    assert.equal(new Set(picks).size,4,game.slug);
    assert.ok(!picks.includes(game.slug),game.slug);
    for(const slug of picks) incoming.add(slug);
  }
  assert.deepEqual(incoming,new Set(games.map(g=>g.slug)));
});
test('related picks respect available rows, category fallback and a smaller limit', () => {
  const options = [{slug:'other',category:'PUZZLE'},{slug:'future',category:'ARCADE'},{slug:'fruit-slice',category:'ARCADE'}];
  assert.deepEqual(selectRelated('fruit-slice','ARCADE',options,1),[options[1]]);
  assert.deepEqual(selectRelated('other','PUZZLE',[],4),[]);
});
