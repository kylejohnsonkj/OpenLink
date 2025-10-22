// OpenTok Extension
// Created by Kyle Johnson

/** -----------------------------
 *  URL Redirection
 * ------------------------------ */

let lastUrl = location.href;

(function() {
    // Watch History API for React Router navigation
    for (const method of ["pushState", "replaceState"]) {
        const original = history[method];
        history[method] = function (...args) {
            const result = original.apply(this, args);
            window.dispatchEvent(new Event("locationchange"));
            return result;
        };
    }

    window.addEventListener("popstate", onUrlChange);
    window.addEventListener("locationchange", onUrlChange);

    // React/TikTok fallback for silent URL rewrites
    new MutationObserver(onUrlChange).observe(document, { childList: true, subtree: true });

    // Run once immediately
    maybeRedirect();
})();

function onUrlChange() {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        maybeRedirect();
    }
}

function cleanTikTokUrl(urlString) {
    try {
        const url = new URL(urlString);
        
        // Only clean video and photo slideshow links
        const match = url.pathname.match(/^\/@[^/]*\/(video|photo)\/(\d+)/);
        if (match) {
            const [, type, id] = match;
            const username = url.pathname.split("/")[1]; // e.g. "@username" or "@"
            
            return `https://www.tiktok.com/${username}/${type}/${id}`;
        }
        
        // Redirect to the first video on the Discover page
        if (/^\/discover\//.test(url.pathname)) {
            const observer = new MutationObserver(() => {
                const link = document.querySelector('div[class*="DivVideoCard"][style*="grid-column"] div[class*="DivVideoPlayer"] a');
                if (link) {
                    observer.disconnect();
                    window.location.replace(link.href);
                }
            });
            observer.observe(document, { childList: true, subtree: true });
            return null; // Let the observer handle the redirect
        }
        
        return null
    } catch {
        return null;
    }
}

function maybeRedirect() {
    const cleanUrl = cleanTikTokUrl(location.href);
    
    if (cleanUrl && cleanUrl !== location.href) {
        location.replace(cleanUrl);
    } else {
        runWhenDomReady(() => {
            // Remove smart app banner and automatically close dialog boxes
            document.querySelector('meta[name="apple-itunes-app"]')?.remove();
            document.querySelector('button[class*="close-button"]')?.click();
            document.querySelector('span[data-e2e*="launch-popup-close"]')?.click();
            
            // Relocate comments under the video
            relocateComments();
            
            // Ensure the "Watch again" button always reloads the video
            fixWatchAgainButton();
            
            // Attempt to insert casual review prompt
            insertMessageUnderWatchAgain();
        });
    }
}

function runWhenDomReady(callback) {
    // Wait until the base DOM exists
    const startObserver = () => {
        const appNode = document.getElementById("app") || document.body;
        if (!appNode) return;
        
        const observer = new MutationObserver(() => {
            callback(); // run whenever DOM changes
        });
        
        observer.observe(appNode, { childList: true, subtree: true });
        
        // Run once immediately in case content is already present
        callback();
    };
    
    if (document.readyState === "complete" || document.readyState === "interactive") {
        startObserver();
    } else {
        window.addEventListener("DOMContentLoaded", startObserver, { once: true });
    }
}

/** ------------------------------
 *  Comments Below Video
 * ------------------------------ */

function relocateComments() {
    const commentsId = "relocated-comments";
    
    // Only do once
    if (document.getElementById(commentsId)) return;
    
    // Open the comments modal
    document.querySelector('div[data-e2e="play-side-comment"]')?.click();
    
    const layoutBox = document.querySelector('div[class*="layout-box"]');
    const commentsHeader = document.querySelector('div[class*="DivHeaderWrapper"]');
    const comments = document.querySelector('div[class*="DivCommentListContainer"]');
    
    // Wait until actual comments are loaded (not skeletons)
    const hasRealComments = comments?.querySelector('div[class*="DivCommentItemContainer"]');
    if (!layoutBox || !commentsHeader || !comments || !hasRealComments) return;
    
    // Relocate the comments below the video
    commentsHeader.id = commentsId;
    layoutBox.appendChild(commentsHeader);
    layoutBox.appendChild(comments);
    
    // Dismiss modal to allow scrolling
    document.querySelector('div[class*="DivCloseWrapper"]')?.click();
}

/** ------------------------------
 *  Watch Again Button
 * ------------------------------ */

function fixWatchAgainButton() {
    let didWatchAgain = false;
    
    document.addEventListener("click", function(event) {
        if (!event.target.closest('div[class*="DivCTABtnContainer"]')) return;
        
        if (didWatchAgain) {
            event.stopPropagation();
            window.location.reload();
        } else {
            didWatchAgain = true;
        }
    }, true);
}

/** ------------------------------
 *  Review Prompt Message
 * ------------------------------ */

function insertMessageUnderWatchAgain() {
    // Exclude from setup video
    const setupVideoId = "/video/6876424179084709126";
    if (window.location.pathname.includes(setupVideoId)) return;
    
    // Exclude if user has already reviewed the current version
    const currentVersion = chrome.runtime.getManifest().version;
    if (currentVersion === localStorage.getItem("OpenTok-lastReviewedVersion")) return;
    
    // Do not reinsert if message is already present
    const messageId = "opentok-message";
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
    link.href = "opentok://review";
    Object.assign(link.style, { color: "white", textDecoration: "none" });
    
    const plainText = document.createElement("span");
    const underlinedText = document.createElement("span");
    underlinedText.style.textDecoration = "underline";
    
    plainText.textContent = "Enjoying OpenTok?";
    underlinedText.textContent = "Help spread the word!";
    link.append(plainText, " ", underlinedText);
    
    link.addEventListener("click", () => {
        localStorage.setItem("OpenTok-lastReviewedVersion", chrome.runtime.getManifest().version);
        plainText.textContent = "Thank you! ❤️";
        underlinedText.textContent = "";
    });
    
    return link;
}
