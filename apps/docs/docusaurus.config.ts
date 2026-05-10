import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Smart ERP Next',
  tagline: 'Hệ thống quản trị doanh nghiệp thông minh — vượt trội KiotViet, MISA, ERPNext',
  favicon: 'img/favicon.ico',

  future: { v4: true },

  url: 'https://docs.smarterp.vn',
  baseUrl: '/',

  organizationName: 'smart-erp',
  projectName: 'smart-erp-next',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    localeConfigs: {
      vi: { label: 'Tiếng Việt', direction: 'ltr' },
      en: { label: 'English', direction: 'ltr' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/smart-erp/smart-erp-next/tree/master/apps/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: { type: ['rss', 'atom'], xslt: true },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/smart-erp-social.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Smart ERP Next',
      logo: { alt: 'Smart ERP Next Logo', src: 'img/logo.svg' },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tài liệu',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/smart-erp/smart-erp-next',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Tài liệu',
          items: [
            { label: 'Giới thiệu', to: '/docs/intro' },
            { label: 'Kiến trúc', to: '/docs/architecture' },
            { label: 'Phát triển', to: '/docs/development' },
          ],
        },
        {
          title: 'Cộng đồng',
          items: [
            { label: 'GitHub Issues', href: 'https://github.com/smart-erp/smart-erp-next/issues' },
            { label: 'Discussions', href: 'https://github.com/smart-erp/smart-erp-next/discussions' },
          ],
        },
        {
          title: 'Thêm',
          items: [
            { label: 'Blog', to: '/blog' },
            { label: 'API Reference', href: 'https://api.smarterp.vn' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Smart ERP Next. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'rust', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
