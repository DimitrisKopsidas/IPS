import { fetchIndexPromoInfo, fetchIndexDeviceInfo } from './dbService.js';

// #region VARIABLE DECLARATION
let totalMoney;
let totalIssued;
let issuedThisWeek;
let redeemedThisWeek;

let promoInfo;
let deviceInfo;
// #endregion VARIABLE DECLARATION

document.addEventListener('DOMContentLoaded', async () => {
    try {
        promoInfo = await fetchIndexPromoInfo();
        deviceInfo = await fetchIndexDeviceInfo();
        
        calculatePromoStatistics();
        displayAdminDashboard();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
});

// #region FUNCTIONS
function calculatePromoStatistics() {
    if (!promoInfo || promoInfo.length === 0) {
        totalMoney = 0;
        totalIssued = 0;
        issuedThisWeek = 0;
        redeemedThisWeek = 0;
        return;
    }

    // Calculate totalMoney: sum of all productprice values
    totalMoney = promoInfo.reduce((sum, promo) => {
        return sum + (parseFloat(promo.productprice) || 0);
    }, 0);

    // Calculate totalIssued: count of all promo lines
    totalIssued = promoInfo.length;

    // Calculate issuedThisWeek: count of promos issued in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    issuedThisWeek = promoInfo.filter(promo => {
        const issueDate = new Date(promo.issuedate);
        return issueDate >= sevenDaysAgo;
    }).length;

    // Calculate redeemedThisWeek: count of promos redeemed in last 7 days
    redeemedThisWeek = promoInfo.filter(promo => {
        if (!promo.redeemdate) return false; // Skip if not redeemed
        const redeemDate = new Date(promo.redeemdate);
        return redeemDate >= sevenDaysAgo;
    }).length;

    console.log('Promo Statistics:', {
        totalMoney: totalMoney.toFixed(2),
        totalIssued,
        issuedThisWeek,
        redeemedThisWeek
    });
}

function getDistinctDevices(devices) {
    if (!devices || devices.length === 0) return [];
    
    // Create a Map to store unique devices by NAME with promo count
    const distinctDevicesMap = new Map();
    
    devices.forEach(device => {
        const name = device.NAME;
        if (distinctDevicesMap.has(name)) {
            // Increment the promo count for this device
            const existingDevice = distinctDevicesMap.get(name);
            existingDevice.promoCount++;
            // Keep the most recent LASTPING
            if (new Date(device.LASTPING) > new Date(existingDevice.LASTPING)) {
                existingDevice.LASTPING = device.LASTPING;
            }
        } else {
            // Add new device with promo count of 1
            distinctDevicesMap.set(name, {
                ...device,
                promoCount: 1
            });
        }
    });
    
    // Convert Map values back to array and sort by most recent LASTPING
    return Array.from(distinctDevicesMap.values())
        .sort((a, b) => new Date(b.LASTPING) - new Date(a.LASTPING));
}

function displayAdminDashboard() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    // Get distinct devices for display
    const distinctDevices = getDistinctDevices(deviceInfo);

    productList.innerHTML = `
        <div class="admin-dashboard">
            <!-- Statistics Summary Section -->
            <div class="admin-section">
                <h2>Statistics Summary</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total Money Value</h4>
                        <p class="stat-number">$${totalMoney ? totalMoney.toFixed(2) : '0.00'}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Total Promos Issued</h4>
                        <p class="stat-number">${totalIssued || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Issued This Week</h4>
                        <p class="stat-number">${issuedThisWeek || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Redeemed This Week</h4>
                        <p class="stat-number">${redeemedThisWeek || 0}</p>
                    </div>
                </div>
            </div>

            <!-- Horizontal Data Sections -->
            <div class="admin-horizontal">
                <!-- Issued Promos Section -->
                <div class="admin-section">
                    <h2>Recent Issued Promos</h2>
                    <div class="admin-data-container">
                        ${promoInfo && promoInfo.length > 0 ? promoInfo.slice(0, 5).map(promo => `
                            <div class="admin-data-line">
                                <span class="data-label">Product:</span>
                                <span class="data-value">${promo.productname}</span>
                                <span class="data-label">Issue Date:</span>
                                <span class="data-value">${new Date(promo.issuedate).toLocaleString('en-GB', { hour12: false })}</span>
                                <span class="data-label">Redeemed:</span>
                                <span class="data-value ${promo.redeemed ? 'status-redeemed' : 'status-pending'}">
                                    ${promo.redeemed ? 'Yes' : 'No'}
                                </span>
                            </div>
                        `).join('') : '<div class="no-data">No issued promos found</div>'}
                    </div>
                </div>

                <!-- Devices Section -->
                <div class="admin-section">
                    <h2>Active Devices</h2>
                    <div class="admin-data-container">
                        ${distinctDevices && distinctDevices.length > 0 ? distinctDevices.slice(0, 5).map(device => `
                            <div class="admin-data-line">
                                <span class="data-label">Name:</span>
                                <span class="data-value">${device.NAME}</span>
                                <span class="data-label">Promos Issued:</span>
                                <span class="data-value">${device.promoCount}</span>
                                <span class="data-label">Status:</span>
                                <span class="data-value ${(() => {
                                    const lastPing = new Date(device.LASTPING);
                                    const now = new Date();
                                    const timeDiff = now - lastPing;
                                    return timeDiff < 30 * 1000 ? 'status-online' : 'status-offline';
                                })()}">
                                    ${(() => {
                                        const lastPing = new Date(device.LASTPING);
                                        const now = new Date();
                                        const timeDiff = now - lastPing;
                                        return timeDiff < 30 * 1000 ? 'Online' : 'Offline';
                                    })()}
                                </span>
                            </div>
                        `).join('') : '<div class="no-data">No devices found</div>'}
                        ${distinctDevices.length > 5 ? `<div class="show-more">... and ${distinctDevices.length - 5} more unique devices</div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}
// #endregion FUNCTIONS

// #region EVENT LISTENERS
// #endregion EVENT LISTENERS