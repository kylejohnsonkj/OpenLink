const url = new URL(location.href);

// MARK: - TikTok

// ROUTE 1: Redirect TikTok videos and photo slideshows to playable links
if (/^\/@[^/]*\/(video|photo)\/\d+/.test(url.pathname)) {
    const newUrl = url.href.split('?')[0] + '?_r=1'; // _r=1 embeds comments below video
    
    if (newUrl !== url.href) {
        // Redirect!
        location.replace(newUrl);
    } else {
        // URL has been redirected. We can now modify the DOM.
        modifyTikTokPage();
    }
}

// ROUTE 2: Modify TikTok channel pages to support navigation
if (/^\/@[^/]+\/?$/.test(url.pathname)) {
    const observer = new MutationObserver(() => {
        // Allow taps on channel videos
        addRecommendationHandlers();
        
        // Add share button support
        attachShareHandler("share-btn");
    });
    
    observer.observe(document, { childList: true, subtree: true });
}

// ROUTE 3: Redirect TikTok discover pages to hero video link (if present)
if (/^\/discover\//.test(url.pathname)) {
    const observer = new MutationObserver(() => {
        const link = document.querySelector('div[class*="DivVideoCard"][style*="grid-column"] div[class*="DivVideoPlayer"] a');
        if (link) {
            const newUrl = link.href.split('?')[0] + '?_r=1';
            location.replace(newUrl);
        }
    });
    
    observer.observe(document, { childList: true, subtree: true });
}

function modifyTikTokPage() {
    // Force "Watch again" button to always reload the video and not redirect to the App Store
    fixWatchAgainButton();
    
    const observer = new MutationObserver(() => {
        // Remove smart app banner and automatically close popups
        document.querySelector('meta[name="apple-itunes-app"]')?.remove();
        document.querySelector('button[class*="close-button"]')?.click();
        document.querySelector('span[data-e2e*="launch-popup-close"]')?.click();
        
        // Add channel button support
        attachChannelHandler();
        
        // Add share button support
        attachShareHandler("play-side-share");
        
        // Attempt to insert casual review prompt
        insertMessageUnderWatchAgain();
    });
    
    observer.observe(document, { childList: true, subtree: true });
}

function attachChannelHandler() {
    const authorButton = document.querySelector('div[data-e2e="play-side-author"]');
    if (authorButton && !authorButton.dataset.listenerAttached) {
        authorButton.dataset.listenerAttached = 'true';
        authorButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            
            const link = authorButton.querySelector('a');
            if (!link) return;
            
            window.location.href = link.href;
        }, true);
    }
}

function attachShareHandler(identifier) {
    const shareButton = document.querySelector(`div[data-e2e="${identifier}"]`);
    if (shareButton && !shareButton.dataset.listenerAttached) {
        shareButton.dataset.listenerAttached = 'true';
        shareButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            
            navigator.share?.({
                title: document.title,
                url: window.location.href
            }) || alert("Sharing not supported");
        }, true);
    }
}

function addRecommendationHandlers() {
//    const recommendedVideos = document.querySelectorAll('li[class*="recommend-item"]');
    const channelVideos = document.querySelectorAll('div[class*="DivMultiColumnItemContainer"]');
    
    channelVideos.forEach(item => {
        if (item.dataset.listenerAttached) return;
        item.dataset.listenerAttached = 'true';
        
        const link = item.querySelector('a');
        if (!link) return;
        
        item.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = link.href + '?_r=1';
        }, true);
    });
}

function fixWatchAgainButton() {
    let didWatchAgain = false;
    
    document.addEventListener("click", function(event) {
        if (!event.target.closest('div[class*="DivCTABtnContainer"]')) return;
        
        if (didWatchAgain) {
            // e.preventDefault(); // breaks capture
            event.stopPropagation();
            location.reload();
        } else {
            didWatchAgain = true;
        }
    }, true);
}

function insertMessageUnderWatchAgain() {
    // Exclude from setup video
    const setupVideoPath = "/video/6876424179084709126";
    if (location.pathname.includes(setupVideoPath)) return;
    
    // Exclude if user has already reviewed the current version
    const currentVersion = chrome.runtime.getManifest().version;
    if (currentVersion === localStorage.getItem("OpenClip-lastReviewedVersion")) return;
    
    // Do not reinsert if message is already present
    const messageId = "openclip-message";
    if (document.getElementById(messageId)) return;
    
    // Do not insert if 'Watch again' container cannot be found
    const targetElement = document.querySelector('div[class*="DivSwiperList"]');
    if (!targetElement) return;
    
    const message = createMessageElement(messageId);
    targetElement.appendChild(message);
}

function createMessageElement(messageId) {
    const message = document.createElement("div");
    message.id = messageId;
    
    Object.assign(message.style, {
        width: "100%",
        textAlign: "center",
        padding: "25px",
        fontSize: "13px",
        fontFamily: "Arial, Tahoma, sans-serif",
        position: "absolute",
        bottom: "0",
        left: "0"
    });
    
    const link = createReviewLink();
    message.appendChild(link);
    return message;
}

function createReviewLink() {
    const link = document.createElement("a");
    link.href = "openclip://review";
    Object.assign(link.style, { color: "white", textDecoration: "none" });
    
    const plainText = document.createElement("span");
    const underlinedText = document.createElement("span");
    underlinedText.style.textDecoration = "underline";
    
    plainText.textContent = "Enjoying OpenClip?";
    underlinedText.textContent = "Help spread the word!";
    link.append(plainText, " ", underlinedText);
    
    link.addEventListener("click", () => {
        localStorage.setItem("OpenClip-lastReviewedVersion", chrome.runtime.getManifest().version);
        plainText.textContent = "Thank you! ❤️";
        underlinedText.textContent = "";
    }, true);
    
    return link;
}
