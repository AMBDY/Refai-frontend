// Social media sharing
function shareToWhatsApp(text, url) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
}

function shareToTwitter(text, url) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
}

function shareToFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}
