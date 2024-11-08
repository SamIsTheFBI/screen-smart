type Site = {
  website: string
  time: number
  blocked: boolean
};

let activeSite: string | null = null;
let startTime: number | null = null;

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    handleSiteChange(changeInfo.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleSiteChange(tab.url || "");
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTiming();
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || "";
      handleSiteChange(url);
    });
  }
});

function handleSiteChange(url: string) {
  if (activeSite) {
    stopTiming();
  }

  const website = extractDomain(url);
  if (website) {
    checkIfBlockedAndStartTiming(website);
  }
}

function stopTiming() {
  if (activeSite && startTime) {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    updateSiteTime(activeSite, elapsedTime);
  }
  activeSite = null;
  startTime = null;
}

function extractDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function updateSiteTime(website: string, timeSpent: number) {
  chrome.storage.sync.get("sites", (data) => {
    const sites: Site[] = data.sites || [];
    const site = sites.find((s) => s.website === website);

    if (site) {
      site.time = (site.time || 0) + timeSpent;
    } else {
      sites.push({ website, blocked: false, time: timeSpent });
    }

    chrome.storage.sync.set({ sites });
  });
}

function checkIfBlockedAndStartTiming(website: string) {
  chrome.storage.sync.get("sites", (data) => {
    const sites: Site[] = data.sites || [];
    const site = sites.find((s) => s.website === website);

    if (site && site.blocked) {
      activeSite = null;
      startTime = null;
    } else {
      activeSite = website;
      startTime = Date.now();
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("sites", (data) => {
    const sites: Site[] = data.sites || [];
    const initialRules = sites
      .filter(site => site.blocked)
      .map((site, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          urlFilter: site.website,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }));

    chrome.declarativeNetRequest.updateDynamicRules(
      { addRules: initialRules },
      () => console.log("Initial rules set")
    );
  });
});

