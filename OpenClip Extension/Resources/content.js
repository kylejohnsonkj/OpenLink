const url = new URL(location.href);

// ROUTE 1: Redirect TikTok videos and photo slideshows to playable links
if (/^\/@[^/]*\/(video|photo)\/\d+/.test(url.pathname)) {
    const newUrl = url.href.split('?')[0] + '?_r=1'; // _r=1 embeds comments below video
    
    if (newUrl !== url.href) {
        // Redirect!
        location.replace(newUrl);
    } else {
        // URL has been redirected. We can now modify the DOM.
        modifyPage();
    }
}

// ROUTE 2: Redirect TikTok discover pages to hero video link (if present)
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

function modifyPage() {
    // Force "Watch again" button to always reload the video and not redirect to the App Store
    fixWatchAgainButton();
    
    const observer = new MutationObserver(() => {
        // Remove smart app banner and automatically close popups
        document.querySelector('meta[name="apple-itunes-app"]')?.remove();
        document.querySelector('button[class*="close-button"]')?.click();
        document.querySelector('span[data-e2e*="launch-popup-close"]')?.click();
        
        // Attempt to insert casual review prompt
        insertMessageUnderWatchAgain();
    });
    
    observer.observe(document, { childList: true, subtree: true });
}

function fixWatchAgainButton() {
    let didWatchAgain = false;
    
    document.addEventListener("click", function(event) {
        if (!event.target.closest('div[class*="DivCTABtnContainer"]')) return;
        
        if (didWatchAgain) {
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
    });
    
    return link;
}
