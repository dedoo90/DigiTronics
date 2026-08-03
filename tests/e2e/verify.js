const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const PAGE = process.argv[2] || 'index.html';
const PORT = parseInt(process.argv[3] || '18940', 10);
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + String(detail).slice(0, 200) : ''));
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/' + PAGE;
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const apiRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (r.url().includes('/api/v1')) apiRequests.push(r.url()); });

  await page.goto('http://127.0.0.1:' + PORT + '/' + PAGE, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  check('Page loads with zero JS errors', errors.length === 0, errors.join(';'));

  await page.evaluate(() => { if (typeof frSkip === 'function') frSkip(); });
  await page.fill('#loginUser', 'admin');
  await page.fill('#loginPass', 'admin123');
  await page.click('#loginBtn');
  await page.waitForTimeout(1500);
  check('Login works', await page.evaluate(() => document.getElementById('app').style.display === 'block' && !!currentUser));
  check('No TDZ errors', !errors.some(e => e.includes('before initialization')), errors.join(';'));
  check('USE_BACKEND === false', await page.evaluate(() => USE_BACKEND === false));

  const sync = await page.evaluate(() => {
    const mods = Object.keys(syncEngine._modules).sort();
    const q0 = syncEngine._queue.length;
    scheduleBackgroundSync(0); schedulePurchaseBackgroundSync(0); scheduleInventoryBackgroundSync(0);
    scheduleInventoryTransactionBackgroundSync(0); scheduleCustomerBackgroundSync(0); scheduleSupplierBackgroundSync(0);
    scheduleTreasuryBackgroundSync(0); scheduleEmployeeBackgroundSync(0); schedulePartnerBackgroundSync(0);
    scheduleReportBackgroundSync(0); scheduleDashboardBackgroundSync(0); scheduleVoucherBackgroundSync(0); scheduleUserBackgroundSync(0);
    scheduleBackgroundRefresh(0); schedulePurchaseBackgroundRefresh(0); scheduleInventoryBackgroundRefresh(0);
    scheduleInventoryTransactionBackgroundRefresh(0); scheduleCustomerBackgroundRefresh(0); scheduleSupplierBackgroundRefresh(0);
    scheduleTreasuryBackgroundRefresh(0); scheduleEmployeeBackgroundRefresh(0); schedulePartnerBackgroundRefresh(0);
    scheduleReportBackgroundRefresh(0); scheduleDashboardBackgroundRefresh(0); scheduleVoucherBackgroundRefresh(0); scheduleUserBackgroundRefresh(0);
    return { mods, queueUnchanged: syncEngine._queue.length === q0 };
  });
  check('syncEngine modules registered (all 13)', JSON.stringify(sync.mods) === '["customers","dashboard","employees","inventory","inventoryTransactions","partners","purchases","reports","sales","suppliers","treasury","users","vouchers"]', sync.mods.join(','));
  check('All 26 schedule fns no-op under flag off', sync.queueUnchanged);

  const prod = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listProducts();
    const one = await digitronicsDataAdapter.getProduct('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendProduct({ id: 'x', name: 'M', buyPrice: '10', sellPrice: '20' });
    const c = detectProductConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.products, missing: one === null, normOk: norm.buyPrice === 10 && norm.sellPrice === 20, conflictOk: c && c.hasConflict === true };
  });
  check('listProducts() legacy returns DB.products', prod.sameRef);
  check('getProduct() missing id safe', prod.missing);
  check('_normalizeBackendProduct coerces prices', prod.normOk);
  check('detectProductConflict works', prod.conflictOk);

  const it = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listInventoryTransactions();
    const one = await digitronicsDataAdapter.getInventoryTransaction('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendInventoryTransaction({ id: 'x', type: 'out', qty: '4', reason: 'sale' });
    const c = detectInventoryTransactionConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.stockMovement, missing: one === null, normOk: norm.qty === 4 && norm.type === 'out', conflictOk: c && c.hasConflict === true };
  });
  check('listInventoryTransactions() legacy returns DB.stockMovement', it.sameRef);
  check('getInventoryTransaction() missing id safe', it.missing);
  check('_normalizeBackendInventoryTransaction works', it.normOk);
  check('detectInventoryTransactionConflict works', it.conflictOk);

  const cust = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listCustomers();
    const one = await digitronicsDataAdapter.getCustomer('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendCustomer({ id: 'x', name: 'N', balance: '25', points: '7' });
    const c = detectCustomerConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.customers, missing: one === null, normOk: norm.balance === 25 && norm.points === 7 && norm.name === 'N', conflictOk: c && c.hasConflict === true };
  });
  check('listCustomers() legacy returns DB.customers', cust.sameRef);
  check('getCustomer() missing id safe', cust.missing);
  check('_normalizeBackendCustomer works', cust.normOk);
  check('detectCustomerConflict works', cust.conflictOk);

  const supp = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listSuppliers();
    const one = await digitronicsDataAdapter.getSupplier('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendSupplier({ id: 'x', name: 'S', email: 's@x.com', balance: '30' });
    const c = detectSupplierConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.suppliers, missing: one === null, normOk: norm.balance === 30 && norm.name === 'S' && norm.email === 's@x.com', conflictOk: c && c.hasConflict === true };
  });
  check('listSuppliers() legacy returns DB.suppliers', supp.sameRef);
  check('getSupplier() missing id safe', supp.missing);
  check('_normalizeBackendSupplier works', supp.normOk);
  check('detectSupplierConflict works', supp.conflictOk);

  const tre = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listTreasury();
    const one = await digitronicsDataAdapter.getTreasury('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendTreasury({ id: 'x', type: 'out', amount: '45', method: 'bank' });
    const c = detectTreasuryConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === getTreasuryEntries(), missing: one === null, normOk: norm.amount === 45 && norm.type === 'out' && norm.method === 'bank', conflictOk: c && c.hasConflict === true };
  });
  check('listTreasury() legacy returns getTreasuryEntries()', tre.sameRef);
  check('getTreasury() missing id safe', tre.missing);
  check('_normalizeBackendTreasury works', tre.normOk);
  check('detectTreasuryConflict works', tre.conflictOk);

  const emp = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listEmployees();
    const one = await digitronicsDataAdapter.getEmployee('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendEmployee({ id: 'x', name: 'E', position: 'Tech', status: 'inactive', salary: '3000', vacationDays: '12' });
    const c = detectEmployeeConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.employees, missing: one === null, normOk: norm.salary === 3000 && norm.vacationDays === 12 && norm.name === 'E' && norm.status === 'inactive', conflictOk: c && c.hasConflict === true };
  });
  check('listEmployees() legacy returns DB.employees', emp.sameRef);
  check('getEmployee() missing id safe', emp.missing);
  check('_normalizeBackendEmployee works', emp.normOk);
  check('detectEmployeeConflict works', emp.conflictOk);

  const prt = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listPartners();
    const one = await digitronicsDataAdapter.getPartner('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendPartner({ id: 'x', name: 'P', capital: '5000', percent: '25' });
    const c = detectPartnerConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.partners, missing: one === null, normOk: norm.capital === 5000 && norm.percent === 25 && norm.name === 'P', conflictOk: c && c.hasConflict === true };
  });
  check('listPartners() legacy returns DB.partners', prt.sameRef);
  check('getPartner() missing id safe', prt.missing);
  check('_normalizeBackendPartner works', prt.normOk);
  check('detectPartnerConflict works', prt.conflictOk);

  const rep = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listReports();
    const one = await digitronicsDataAdapter.getReport('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendReport({ id: 'x', type: 'monthly', title: 'T' });
    const c = detectReportConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { listOk: Array.isArray(list) && list.length === (DB.reports || []).length, missing: one === null, normOk: norm.type === 'monthly' && norm.title === 'T' && norm.month === '', conflictOk: c && c.hasConflict === true };
  });
  check('listReports() legacy returns DB.reports || []', rep.listOk);
  check('getReport() missing id safe', rep.missing);
  check('_normalizeBackendReport works', rep.normOk);
  check('detectReportConflict works', rep.conflictOk);

  const dash = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listDashboard();
    const one = await digitronicsDataAdapter.getDashboard('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendDashboard({ id: 'x', key: 'kpis', title: 'T' });
    const c = detectDashboardConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { listOk: Array.isArray(list) && list.length === (DB.dashboard || []).length, missing: one === null, normOk: norm.key === 'kpis' && norm.title === 'T' && norm.period === '', conflictOk: c && c.hasConflict === true };
  });
  check('listDashboard() legacy returns DB.dashboard || []', dash.listOk);
  check('getDashboard() missing id safe', dash.missing);
  check('_normalizeBackendDashboard works', dash.normOk);
  check('detectDashboardConflict works', dash.conflictOk);

  const vch = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listVouchers();
    const one = await digitronicsDataAdapter.getVoucher('__nope__');
    const norm = digitronicsDataAdapter._normalizeBackendVoucher({ id: 'x', type: 'receipt', partyName: 'P', amount: '75' });
    const c = detectVoucherConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    return { sameRef: list === DB.vouchers, missing: one === null, normOk: norm.amount === 75 && norm.type === 'receipt' && norm.partyName === 'P' && norm.method === '', conflictOk: c && c.hasConflict === true };
  });
  check('listVouchers() legacy returns DB.vouchers', vch.sameRef);
  check('getVoucher() missing id safe', vch.missing);
  check('_normalizeBackendVoucher works', vch.normOk);
  check('detectVoucherConflict works', vch.conflictOk);

  const usr = await page.evaluate(async () => {
    const list = await digitronicsDataAdapter.listUsers();
    const one = await digitronicsDataAdapter.getUser('__nope__');
    const byName = await digitronicsDataAdapter.getUser('admin');
    const norm = digitronicsDataAdapter._normalizeBackendUser({ id: 'x', username: 'u1', role: 'Manager' });
    const c = detectUserConflict({ id: 1, updatedAt: '2026-01-01' }, { id: 1, updatedAt: '2026-01-02' });
    const cu = await digitronicsDataAdapter.currentUser();
    return { sameRef: list === DB.users, missing: one === null, byNameOk: !!byName && byName.username === 'admin', normOk: norm.username === 'u1' && norm.role === 'Manager' && norm.fullName === '', conflictOk: c && c.hasConflict === true, cuOk: cu === currentUser };
  });
  check('listUsers() legacy returns DB.users', usr.sameRef);
  check('getUser() missing id safe', usr.missing);
  check('getUser() finds by username (legacy)', usr.byNameOk);
  check('_normalizeBackendUser works', usr.normOk);
  check('detectUserConflict works', usr.conflictOk);
  check('adapter currentUser() returns session user (legacy)', usr.cuOk);

  const authLegacy = await page.evaluate(() => {
    return {
      sessionSet: (localStorage.getItem('cairo_session_user') || '') === 'admin',
      role: currentUser && currentUser.role,
      canProducts: canAccessPage('products'),
      canUsers: canAccessPage('users')
    };
  });
  check('Session stored in localStorage (legacy)', authLegacy.sessionSet);
  check('Current user has Admin role', authLegacy.role === 'Admin', String(authLegacy.role));
  check('Permissions: admin can access products/users pages', authLegacy.canProducts && authLegacy.canUsers);

  const sp = await page.evaluate(async () => {
    const s = await digitronicsDataAdapter.listSales();
    const p = await digitronicsDataAdapter.listPurchases();
    return { s: s === DB.saleInvoices, p: p === DB.purchaseInvoices };
  });
  check('Sales adapter unchanged', sp.s);
  check('Purchases adapter unchanged', sp.p);

  const err0 = errors.length;
  await page.evaluate(() => showPage('products'));
  await page.waitForTimeout(800);
  await page.evaluate(() => showPage('invoices'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('purchases'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('customers'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('suppliers'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('treasury'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('employees'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('partners'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('reports'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('dashboard'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('vouchers'));
  await page.waitForTimeout(500);
  await page.evaluate(() => showPage('users'));
  await page.waitForTimeout(500);
  check('All module pages render clean', errors.length === err0, errors.slice(err0).join(';'));
  check('No /api/v1 requests (flag off)', apiRequests.length === 0, apiRequests.slice(0, 2).join(','));

  console.log('---');
  const failed = results.filter(r => !r.ok);
  console.log(PAGE + ' | TOTAL: ' + results.length + ' | PASS: ' + (results.length - failed.length) + ' | FAIL: ' + failed.length);
  await browser.close();
  server.close();
  process.exit(failed.length ? 1 : 0);
})();
