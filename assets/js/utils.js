/* SHARED UTILITIES */

function toggleMobileNav() {
    const links = document.querySelector('.nav-links');
    if (!links) return;
    if (links.style.display === 'flex') {
        links.style.display = '';
    } else {
        links.style.display = 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'fixed';
        links.style.top = '58px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'rgba(8,12,16,0.97)';
        links.style.padding = '20px';
        links.style.borderBottom = '1px solid rgba(56,189,248,0.08)';
        links.style.zIndex = '499';
    }
}

function parseFrontmatter(raw) {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, content: raw };

    const meta = {};
    match[1].split('\n').forEach(line => {
        const [key, ...val] = line.split(':');
        if (key && val) meta[key.trim()] = val.join(':').trim();
    });

    return { meta, content: match[2] };
}

function highlightCode() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(document.getElementById('post-body') || document);
    }
}
