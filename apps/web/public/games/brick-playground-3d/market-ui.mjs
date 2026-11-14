import { advanceDailyMarket, dailyMarketStatus } from './daily-market.mjs';
import { clockLabel } from './resident-routines.mjs';
import { advanceShopkeeper, keeperStatus } from './shopkeeper.mjs';
import { shopStock, stockTarget } from './shop-stock.mjs';
import { blockAt, entranceAvailable, householdsFor } from './settlement.mjs';
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
export function marketControls({
  city,
  player,
  playing,
  save,
  walkFrom,
  ring,
  planDelivery,
  canPlan = () => true
}) {
  const till = $('marketTill'),
    board = $('marketBoard');
  let keeperSaveClock = 0;
  const keeperHints = {
    complete: 'Shift complete · 2 households served.',
    paused: 'Shift paused.',
    missing: 'Restore the shop doorway to resume the shift.',
    blocked: 'Clear standing space beside the till to resume the shift.',
    stock: 'Waiting for a stock delivery.',
    waiting: 'Waiting for customers to arrive.',
    serving: 'Serving the customer at the till.'
  };
  function keeperReport(data) {
    const keeper = data?.market?.keeper;
    $('marketKeeperReport').hidden = $('marketKeeperPause').hidden = !keeper;
    if (!keeper) return;
    const status = keeperStatus(data);
    label(
      'marketKeeperReport',
      keeper.name +
        ' · ' +
        keeperHints[status] +
        (status === 'serving' && $('residentSetup').open ? ' Close menus to continue.' : '')
    );
    label('marketKeeperPause', keeper.paused ? 'Resume shopkeeper' : 'Pause shopkeeper');
    $('marketKeeperPause').disabled = data.market.receipts.length >= 2;
  }
  let historyKey = '';
  function dailyReport(data) {
    const daily = data?.market?.daily;
    $('marketDailyReport').hidden =
      $('marketDailyPause').hidden =
      $('marketHistory').hidden =
        !daily;
    if (!daily) {
      historyKey = '';
      return;
    }
    const state = dailyMarketStatus(data);
    const hints = {
      paused:
        'Automatic reopening and invitations paused. Current customers can still be served.',
      missing: 'Restore the shop doorway to resume daily trading.',
      trading:
        'Serve this round’s two households. Unfinished purchases carry over to the next day.',
      overnight: 'Next opening · ' + clockLabel(daily.next) + '.',
      leaving: 'Waiting for served customers to leave the till.',
      ready: 'Ready to reopen when you close menus.'
    };
    label(
      'marketDailyReport',
      'Trading round ' +
        daily.round +
        ' · ' +
        daily.served +
        ' purchases total. ' +
        hints[state]
    );
    label(
      'marketDailyPause',
      daily.paused ? 'Resume daily reopening' : 'Pause daily reopening'
    );
    const key = JSON.stringify(daily.recent);
    if (key !== historyKey) {
      historyKey = key;
      $('marketHistory').replaceChildren(
        ...daily.recent
          .slice()
          .reverse()
          .map((r) => {
            const li = document.createElement('li');
            li.textContent = 'Round ' + r.round + ' · ' + r.names.join(' and ');
            return li;
          })
      );
    }
  }
  function report() {
    const data = city(),
      market = data?.market;
    if (!data) return;
    const counter = market && marketCounter(data),
      done = market?.receipts.length === 2;
    $('marketDoor').disabled = !!market;
    $('marketSupplied').disabled = !!market;
    if (market) {
      $('marketSupplied').checked = !!market.supplied;
      $('marketStaffed').checked = !!market.keeper;
      if (market.keeper) $('marketKeeperName').value = market.keeper.name;
      $('marketDaily').checked = !!market.daily;
      if (market.daily) $('marketOpening').value = market.daily.hour;
    }
    if (!$('marketSupplied').checked)
      $('marketStaffed').checked = $('marketDaily').checked = false;
    $('marketDaily').disabled = !!market || !$('marketSupplied').checked;
    $('marketOpening').disabled = !!market;
    $('marketDailyFields').hidden = !$('marketDaily').checked;
    dailyReport(data);
    $('marketStaffed').disabled = !!market || !$('marketSupplied').checked;
    $('marketKeeperFields').hidden = !$('marketStaffed').checked;
    $('marketKeeperName').disabled = !!market;
    keeperReport(data);
    const supplied = market ? market.supplied : $('marketSupplied').checked;
    const target = stockTarget(data);
    $('marketStock').hidden = !supplied;
    $('marketRestock').hidden = !market?.supplied;
    $('marketRestock').disabled =
      !canPlan() || !target || !data.streets.includes(target.street) || data.streets.length < 2;
    if (supplied)
      label(
        'marketStock',
        shopStock(data, market?.shop || $('marketDoor').value) +
          ' household supplies in stock. ' +
          (!market
            ? 'Open this market to accept deliveries.'
            : !target
              ? 'Restore the shop doorway to accept deliveries.'
              : !data.streets.includes(target.street)
                ? 'Restore the frontage street in City map to accept deliveries.'
                : !canPlan()
                  ? 'Use Build or Play to leave the buggy before planning another delivery.'
                  : data.streets.length < 2
                    ? 'Lay a second street for the pickup before planning a delivery.'
                    : 'One delivered crate adds 2; each purchase uses 1.')
      );

    $('marketOpen').hidden = !!market;
    $('marketOpen').disabled =
      !$('marketDoor').value ||
      ($('marketStaffed').checked && !$('marketKeeperName').value.trim());
    $('marketCall').hidden = $('marketWork').hidden = !market || done;
    $('marketEnd').hidden = !market;
    label(
      'marketEnd',
      market?.daily
        ? 'End daily market and clear history'
        : done
          ? 'Clear result'
          : 'End market'
    );
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
      .filter(p => isEntrance(p) && entranceAvailable(data, p.id, 'market'))
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
    keeperReport(data);
    dailyReport(data);
    if (!market) return;
    const counter = marketCounter(data),
      guest = nextCustomer(data),
      n = market.receipts.length;
    const distance =
      counter &&
      Math.ceil(Math.hypot(player().x - counter.inside.x, player().z - counter.inside.z));
    let hint = 'Market Day · ' + n + '/2';
    if (n === 2)
      hint = market.daily
        ? 'Round ' +
          market.daily.round +
          ' complete · ' +
          (market.daily.paused ? 'reopening paused' : 'next ' + clockLabel(market.daily.next))
        : 'Market Day complete · 2/2';
    else if (guest && canServe(data, player(), playing()))
      hint =
        market.supplied && !shopStock(data)
          ? 'Out of stock · plan a delivery'
          : 'Serve ' +
            guest.name +
            (market.supplied ? ' · ' + shopStock(data) + ' in stock' : '');
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
    if (
      market.supplied &&
      n < 2 &&
      !hint.startsWith('Serve') &&
      !hint.startsWith('Out of stock')
    )
      hint += ' · Stock ' + shopStock(data);
    if (market.keeper && !playing() && n < 2)
      hint = market.keeper.name + ' · ' + keeperHints[keeperStatus(data)];
    label('marketTill', hint);
  }
  $('resSettings').addEventListener('click', populate);
  board.ontoggle = () => {
    if (board.open && $('residentSetup').open) populate();
  };
  $('marketDoor').onchange =
    $('marketSupplied').onchange =
    $('marketStaffed').onchange =
    $('marketDaily').onchange =
    $('marketOpening').onchange =
      report;
  $('marketKeeperName').oninput = report;
  $('marketDailyPause').onclick = () => {
    const daily = city()?.market?.daily;
    if (!daily) return;
    daily.paused = !daily.paused;
    save();
    report();
    update();
  };
  $('marketKeeperPause').onclick = () => {
    const keeper = city()?.market?.keeper;
    if (!keeper || $('marketKeeperPause').disabled) return;
    keeper.paused = !keeper.paused;
    save();
    keeperReport(city());
    update();
  };
  $('marketRestock').onclick = () => {
    const target = stockTarget(city());
    if (!target || $('marketRestock').disabled) return;
    $('residentSetup').close();
    planDelivery(target.street);
  };
  $('marketOpen').onclick = () => {
    if (
      openMarket(
        city(),
        $('marketDoor').value,
        $('marketSupplied').checked,
        $('marketStaffed').checked ? $('marketKeeperName').value : '',
        $('marketDaily').checked ? Number($('marketOpening').value) : null
      )
    ) {
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
  function step(dt) {
    const data = city(),
      keeper = data?.market?.keeper;
    if (advanceDailyMarket(data)) save();
    if (!keeper) {
      keeperSaveClock = 0;
      return;
    }
    const before = keeper.customer,
      wait = keeper.wait;
    const served = advanceShopkeeper(data, dt);
    if (keeper.wait !== wait) keeperSaveClock += dt;
    if (served || before !== keeper.customer || keeperSaveClock >= 1) {
      keeperSaveClock = 0;
      save();
    }
    if (served) ring(served.name, data.market.receipts.length);
  }
  return { update, step };
}
