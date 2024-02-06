const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const htmlmin = require('html-minifier');
const { DateTime } = require('luxon');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  const markdownItOptions = {
    html: true,
  };

  const markdownItAnchorOptions = {
    permalink: true
  };

  const markdownLib = markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions);

  eleventyConfig.setLibrary('md', markdownLib);

  const buildTimestamp = Date.now();

  eleventyConfig.addPassthroughCopy('CNAME');

  eleventyConfig.setBrowserSyncConfig({
    files: './public/styles/**/*.css',
  });

  eleventyConfig.addPassthroughCopy('src/static');

  eleventyConfig.addFilter('formatDate', (isoDate) => {
    return DateTime.fromISO(isoDate, { zone: 'utc+2' }).toFormat('dd LLLL yyyy');
  });

  eleventyConfig.addFilter('buildUrl', (path, addTimestamp = false) => {
    const timestampParam = addTimestamp ? `?v=${buildTimestamp}` : '';
    const websiteUrl = process.env.ELEVENTY_ENV === 'production' ? `https://arcticpaws.ca${path}` : path;

    return `${websiteUrl}${timestampParam}`;
  });

  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  eleventyConfig.addShortcode('age', () => `${new Date().getFullYear() - 1984}`);

  eleventyConfig.addPlugin(syntaxHighlight);

  if (process.env.ELEVENTY_ENV === 'production') {
    eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        return htmlmin.minify(content, {
          collapseInlineTagWhitespace: false,
          collapseWhitespace: true,
          removeComments: true,
          sortClassName: true,
          useShortDoctype: true,
        });
      }

      return content;
    });
  }

  return {
    dir: {
      input: 'src',
      output: 'public',
    },
  };
};

function renderPermalink(slug, opts, state, idx) {
  const position = { false: 'push', true: 'unshift' };
  const space = () => Object.assign(new state.Token('text', '', 0), { content: ' ' });

  const linkTokens = [
    Object.assign(new state.Token('link_open', 'a', 1), {
      attrs: [
        ['class', opts.permalinkClass],
        ['href', opts.permalinkHref(slug, state)],
      ],
    }),
    Object.assign(new state.Token('html_block', '', 0), {
      content: `<span aria-hidden="true" class="header-anchor__symbol" title="Direct link to this section"><img src="/static/svg/link.svg" height="20" alt="link icon"></span>`,
    }),
    new state.Token('link_close', 'a', -1),
  ];

  if (opts.permalinkSpace) {
    linkTokens[position[!opts.permalinkBefore]](space());
  }
  state.tokens[idx + 1].children[position[opts.permalinkBefore]](...linkTokens);
}