// DNS Record type descriptions for inline help
const TYPE_DESCRIPTIONS = {
    'A': 'Points your subdomain to an IPv4 address (like 93.184.216.34). This is the most common record type.',
    'AAAA': 'Points your subdomain to an IPv6 address. Works just like an A record, but for the newer address format.',
    'CNAME': 'Points your subdomain to another hostname. Great for Cloudflare Tunnels, GitHub Pages, or services that give you a hostname.',
    'TXT': 'Stores text data. Used for domain verification, SPF, DKIM, DMARC, and other metadata.',
    'MX': 'Tells email servers where to deliver mail for your subdomain. Requires a priority value.'
};

// Show/hide priority field and type description when record type changes
function updateTypeHelp(type) {
    var helpDiv = document.getElementById('typeHelp');
    var priorityGroup = document.getElementById('priorityGroup');

    if (type && TYPE_DESCRIPTIONS[type]) {
        helpDiv.textContent = TYPE_DESCRIPTIONS[type];
        helpDiv.classList.add('visible');
    } else {
        helpDiv.classList.remove('visible');
    }

    if (priorityGroup) {
        priorityGroup.style.display = (type === 'MX') ? '' : 'none';
    }
}

// Copy domain to clipboard
function copyDomain() {
    var domainEl = document.getElementById('domainName');
    if (domainEl) {
        navigator.clipboard.writeText(domainEl.textContent).then(function() {
            showToast('Domain copied to clipboard');
        });
    }
}

// Copy zone file to clipboard
function copyZone() {
    var zoneEl = document.getElementById('zoneContent');
    if (zoneEl) {
        navigator.clipboard.writeText(zoneEl.textContent).then(function() {
            showToast('Zone file copied to clipboard');
        });
    }
}

// Real-time subdomain availability check
var checkTimeout = null;
function checkAvailability(handle) {
    var statusEl = document.getElementById('availability');
    var previewEl = document.getElementById('domainPreview');
    var previewDomain = document.getElementById('previewDomain');

    if (!statusEl) return;

    handle = handle.toLowerCase().trim();

    if (handle.length < 3) {
        statusEl.textContent = '';
        statusEl.className = 'availability-status';
        if (previewEl) previewEl.style.display = 'none';
        return;
    }

    // Show preview
    if (previewEl && previewDomain) {
        var suffix = document.querySelector('.domain-suffix');
        var baseDomain = suffix ? suffix.textContent : '.codersfarm.com';
        previewDomain.textContent = handle + baseDomain;
        previewEl.style.display = '';
    }

    // Debounce
    clearTimeout(checkTimeout);
    checkTimeout = setTimeout(function() {
        statusEl.textContent = 'Checking...';
        statusEl.className = 'availability-status';

        fetch('/api/subdomains/check/' + encodeURIComponent(handle))
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.available) {
                    statusEl.textContent = handle + ' is available!';
                    statusEl.className = 'availability-status available';
                } else {
                    statusEl.textContent = handle + ' is not available';
                    statusEl.className = 'availability-status unavailable';
                }
            })
            .catch(function() {
                statusEl.textContent = '';
            });
    }, 300);
}

// Simple toast notification
function showToast(message) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;background:#1e293b;color:white;' +
        'padding:0.6rem 1.2rem;border-radius:6px;font-size:0.9rem;z-index:999;' +
        'animation:fadeIn 0.2s ease;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2500);
}

// "What is this?" links — toggle inline learn cards
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('what-is-this')) {
        e.preventDefault();
        var topic = e.target.getAttribute('data-learn');
        // For now, show the type help if it exists
        var helpDiv = document.getElementById('typeHelp');
        if (helpDiv) {
            helpDiv.classList.toggle('visible');
        }
    }
});
