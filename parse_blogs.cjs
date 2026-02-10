const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync('C:/Users/WIN 11 PRO/Downloads/aranya-resort-main/blogs_extracted/BlogforJungleheritage.html', 'utf8');
const dom = new JSDOM(htmlContent);
const doc = dom.window.document;

const blogs = [];
let currentBlog = null;

const bodyChildren = Array.from(doc.body.children);

bodyChildren.forEach((el) => {
    const text = el.textContent.trim();

    // Check for Blog markers (e.g., "Blog 1")
    if (text.match(/^Blog \d+$/)) {
        if (currentBlog) blogs.push(currentBlog);
        currentBlog = {
            title: '',
            category: 'General',
            excerpt: '',
            featured_image: '',
            blocks: []
        };
        return;
    }

    if (!currentBlog) return;

    // Check for Title (usually the first H1 or significant bold text after Blog marker)
    if (!currentBlog.title && (el.tagName === 'H1' || (el.tagName === 'P' && el.classList.contains('c26')))) {
        currentBlog.title = text;
        return;
    }

    // Check for Excerpt (usually the first italicized or sub-text)
    if (!currentBlog.excerpt && el.tagName === 'P' && el.querySelector('.c32, .c12')) {
        currentBlog.excerpt = text;
        return;
    }

    // Check for Meta Description (to be used as excerpt if needed)
    if (text.startsWith('Meta Description')) {
        currentBlog.excerpt = text.replace('Meta Description', '').trim();
        return;
    }

    // Process Blocks
    if (el.tagName === 'H2') {
        currentBlog.blocks.push({
            id: Math.random().toString(36).substring(7),
            type: 'heading',
            content: text,
            level: 2
        });
    } else if (el.tagName === 'H3') {
        currentBlog.blocks.push({
            id: Math.random().toString(36).substring(7),
            type: 'heading',
            content: text,
            level: 3
        });
    } else if (el.querySelector('img')) {
        const img = el.querySelector('img');
        const src = img.getAttribute('src');
        if (!currentBlog.featured_image && currentBlog.blocks.length === 0) {
            currentBlog.featured_image = src;
        } else {
            currentBlog.blocks.push({
                id: Math.random().toString(36).substring(7),
                type: 'image',
                content: src,
                caption: ''
            });
        }
    } else if (text && !text.includes('Wildlife of Dudhwa National Park...') && !text.includes('Best Time to Visit Dudhwa Natio...')) {
        currentBlog.blocks.push({
            id: Math.random().toString(36).substring(7),
            type: 'paragraph',
            content: text
        });
    }
});

if (currentBlog) blogs.push(currentBlog);

// Post-process to fix slugs and categories
blogs.forEach((blog, i) => {
    if (blog.title.includes('Best Time')) blog.category = 'Travel Guide';
    if (blog.title.includes('Wildlife')) blog.category = 'Wildlife';
    if (blog.title.includes('Luxury')) blog.category = 'Resort';
    if (blog.title.includes('Weekend Escape')) blog.category = 'Travel Guide';
    if (blog.title.includes('Eco-Luxury')) blog.category = 'Sustainability';
});

fs.writeFileSync('blogs_structured.json', JSON.stringify(blogs, null, 2));
console.log('Processed', blogs.length, 'blogs');
