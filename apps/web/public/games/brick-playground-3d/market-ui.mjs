import { blockAt, householdsFor } from './settlement.mjs';
import { isEntrance, entrance } from './resident-trip.mjs';
import {
  marketCounter,
  openMarket,
  shoppers,
  callShoppers,
  nextCustomer,
  canServe,
  serveCustomer,
  waitingAtTill
} from './market-day.mjs';
const $ = (id) => document.getElementById(id);
function label(id, value) {
  if ($(id).textContent !== value) $(id).textContent = value;
}
export function marketControls({ city, player, playing, save, walkFrom, ring }) {
  const till = $('marketTill'),
    board = $('marketBoard');
  function report() {
    const data = city(),
      market = data?.market;
    if (!data) return;
    const counter = market && marketCounter(data),
      done = market?.receipts.length === 2;
    $('marketDoor').disabled = !!market;
    $('marketOpen').hidden = !!market;
    $('marketOpen').disabled = !$('marketDoor').value;
    $('marketCall').hidden = $('marketWork').hidden = !market || done;
    $('marketEnd').hidden = !market;
    label('marketEnd', done ? 'Clear result' : 'End market');
    const entries = market?.receipts || [];
    $('marketReceipts').replaceChildren(
      ...entries.map((r) => {
        const li = document.createElement('li');
        li.textContent = r.name + (r.block ? ' · home in ' + r.block : '');
        return li;
      })
    );
    if (!market) {
      label(
        'marketReport',
        $('marketDoor').value
          ? 'Assign spaza visitors to this entrance in Residents. Each household can make one purchase.'
          : 'Build a ground-floor doorway or add the practice spaza first.'
      );
      return;
    }
    if (done) {
      label('marketReport', 'Market Day complete · 2 households served.');
      return;
    }
    const guests = shoppers(data),
      ready = guests.filter((p) => data[p.key].phase === 'done' && !data[p.key].paused);
    $('marketCall').disabled = !counter || !ready.length;
    $('marketWork').disabled = !counter;
    label(
      'marketReport',
      counter
        ? entries.length +
            '/2 served at ' +
            counter.block.code +
            '. ' +
            (guests.length
              ? guests
                  .map((p) => {
                    const t = data[p.key];
                    return (
                      p.name +
                      ' · ' +
                      (t.paused
                        ? 'paused'
                        : waitingAtTill(data, p, t)
                          ? 'at the till'
                          : t.phase === 'done'
                            ? 'at home'
                            : t.returning
                              ? 'returning home'
                              : 'on the way')
                    );
                  })
                  .join(', ')
              : 'Assign another household to shop at this entrance.')
        : 'The market entrance is missing. Restore its doorway or end this market.'
    );
  }
  function populate() {
    const data = city();
    if (!data) return;
    const select = $('marketDoor'),
      old = select.value;
    const destinations = new Set(
      householdsFor(data)
        .filter((p) => p.destination === 'Spaza' && data[p.key])
        .map((p) => data[p.key].shop)
    );
    const doors = data.pieces
      .filter(isEntrance)
      .sort((a, b) => Number(destinations.has(b.id)) - Number(destinations.has(a.id)));
    select.replaceChildren(
      ...doors.map(
        (d) =>
          new Option(
            blockAt(d.x, d.z).code +
              ' · (' +
              d.x +
              ', ' +
              d.z +
              ') · ' +
              entrance(d).direction +
              (destinations.has(d.id) ? ' · spaza' : ''),
            d.id
          )
      )
    );
    if (data.market && !doors.some((d) => d.id === data.market.shop))
      select.add(new Option('Missing doorway', data.market.shop));
    select.value =
      data.market?.shop || (doors.some((d) => d.id === old) ? old : doors[0]?.id || '');
    report();
  }
  function update() {
    const data = city(),
      market = data?.market;
    if (till.hidden !== !market) till.hidden = !market;
    if (!market) return;
    const counter = marketCounter(data),
      guest = nextCustomer(data),
      n = market.receipts.length;
    const distance =
      counter &&
      Math.ceil(Math.hypot(player().x - counter.inside.x, player().z - counter.inside.z));
    let hint = 'Market Day · ' + n + '/2';
    if (n === 2) hint = 'Market Day complete · 2/2';
    else if (guest && canServe(data, player(), playing())) hint = 'Serve ' + guest.name;
    else if (!counter) hint += ' · missing shop';
    else if (playing())
      hint +=
        ' · Till ' +
        counter.block.code +
        ' · ' +
        distance +
        ' studs' +
        (guest ? ' · customer waiting' : '');
    else hint += guest ? ' · ' + guest.name + ' waiting' : ' · ' + counter.block.code;
    label('marketTill', hint);
  }
  $('resSettings').addEventListener('click', populate);
  board.ontoggle = () => {
    if (board.open && $('residentSetup').open) populate();
  };
  $('marketDoor').onchange = report;
  $('marketOpen').onclick = () => {
    if (openMarket(city(), $('marketDoor').value)) {
      save();
      populate();
      update();
    }
  };
  $('marketCall').onclick = () => {
    if (callShoppers(city())) save();
    $('residentSetup').close();
    update();
  };
  $('marketWork').onclick = () => {
    const counter = marketCounter(city());
    if (counter) {
      $('residentSetup').close();
      walkFrom(counter);
      update();
    }
  };
  $('marketEnd').onclick = () => {
    delete city().market;
    save();
    populate();
    update();
  };
  till.onclick = () => {
    const data = city(),
      served = serveCustomer(data, player(), playing());
    if (served) {
      ring(served.name, data.market.receipts.length);
      save();
      update();
    } else {
      $('resSettings').click();
      board.open = true;
      populate();
      board.scrollIntoView({ block: 'nearest' });
    }
  };
  return { update };
}
