import type { ReactNode } from 'react';
import Guides from '../Guides';
import { createOutlined } from '../../../../components/outlined/Outlined';
// The same Beam mark as the phone in content 04, and the same avatar photo as content 13.
import beamLogo from '../content-04/assets/beam-logo.svg';
import avatar from '../content-13/assets/avatar.webp';
import { GLYPHS, TEXT } from './glyphs';
import './FileBrowser.css';

// Content 10 (Figma Portfolio-2026, node 141:25483): Beam's file browser (sidebar, the "My
// Beam" file table and its totals), built in code at the frame's design size (802 × 479).
// The app window runs past the frame's right and bottom edges, which crop it, as in Figma.
// BeamGallery scales it to the tile with SceneFit. Its text is outlines (glyphs.ts) and its
// icons inline SVG, so it loads no font.

const T = createOutlined(GLYPHS, TEXT);

const FOLDERS = [
  { name: 'Folder 001', count: '4', tone: 'selected' },
  { name: 'Website assets', count: '88', tone: 'plain' },
  { name: 'Project boilerplate', count: '92', tone: 'white' },
] as const;

const FILES = [
  ['Folder 001', '2.4KB', '5 days ago'],
  ['Product Resources', '856MB', '5 days ago'],
  ['Website Assets', '420MB', '6 days ago'],
  ['Brand Guidelines', '184MB', '4 days ago'],
  ['Marketing Assets', '96.8MB', '6 days ago'],
  ['Product Screenshots', '42.6MB', '7 days ago'],
  ['Design System', '18.2MB', '3 days ago'],
  ['Starter Project', '8.4MB', '6 days ago'],
  ['Documentation', '2.1MB', '6 days ago'],
  ['Project Brief', '24.8KB', '5 days ago'],
];

const STATS = [['Folders', '3'], ['Files', '10'], ['Storage used', '1.63 GB']];

// The app's icons, as Figma exported them, each centred in its 7.025 frame.
function Icon({ box = '0 0 7.025 7.025', stroke = '#0A0A0A', children }: { box?: string; stroke?: string; children: ReactNode }) {
  return (
    <svg className="beam-files__icon" width="7.025" height="7.025" viewBox={box} fill="none" stroke={stroke} strokeWidth="0.585417" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const Chevron = () => <Icon box="-0.4388 -2.4878 7.025 7.025" stroke="#7A7A7A"><path d="M0.292728 0.292728L3.07346 2.34169L5.85419 0.292728" /></Icon>;
const MoreIcon = () => (
  <Icon stroke="none">
    <path d="M3.51172 4.09791C3.83504 4.09791 4.09714 3.83581 4.09714 3.51249C4.09714 3.18918 3.83504 2.92708 3.51172 2.92708C3.1884 2.92708 2.9263 3.18918 2.9263 3.51249C2.9263 3.83581 3.1884 4.09791 3.51172 4.09791Z" fill="#1C1F21" />
    <path d="M1.17005 4.09791C1.49337 4.09791 1.75547 3.83581 1.75547 3.51249C1.75547 3.18918 1.49337 2.92708 1.17005 2.92708C0.846735 2.92708 0.584635 3.18918 0.584635 3.51249C0.584635 3.83581 0.846735 4.09791 1.17005 4.09791Z" fill="#1C1F21" />
    <path d="M5.85339 4.09791C6.1767 4.09791 6.4388 3.83581 6.4388 3.51249C6.4388 3.18918 6.1767 2.92708 5.85339 2.92708C5.53007 2.92708 5.26797 3.18918 5.26797 3.51249C5.26797 3.83581 5.53007 4.09791 5.85339 4.09791Z" fill="#1C1F21" />
  </Icon>
);

export default function FileBrowser() {
  return (
    <div className="beam-files" aria-hidden="true">
      <Guides x={[60, 740]} y={[121.12]} />
      <div className="beam-files__window">
        <aside className="beam-files__sidebar">
          <div className="beam-files__sidebar-top">
            <div className="beam-files__workspace">
              <span className="beam-files__brand">
                <span className="beam-files__logo"><img src={beamLogo} alt="" width="5.854" height="5.854" /></span>
                <span className="beam-files__workspace-name"><T k="workspace" className="beam-files__black">Personal</T><Chevron /></span>
              </span>
              <Icon box="-0.1499 -0.7316 7.025 7.025" stroke="#212121">
                <path d="M1.46354 5.26875L5.26875 5.26875C5.91538 5.26875 6.43958 4.74455 6.43958 4.09792L6.43958 1.46354C6.43958 0.816908 5.91538 0.292708 5.26875 0.292708L1.46354 0.292708C0.816908 0.292708 0.292708 0.816908 0.292708 1.46354L0.292708 4.09792C0.292708 4.74455 0.816908 5.26875 1.46354 5.26875Z" />
                <path d="M1.75625 1.75625V3.80521" />
              </Icon>
            </div>
            <div className="beam-files__nav">
              <div className="beam-files__actions">
                <div className="beam-files__search">
                  <span className="beam-files__with-icon">
                    <Icon box="-0.4392 -0.4395 7.025 7.025" stroke="#7A7A7A">
                      <path d="M4.04075 4.04053L5.85437 5.85415" />
                      <path d="M2.48802 4.68333C3.70046 4.68333 4.68333 3.70046 4.68333 2.48802C4.68333 1.27558 3.70046 0.292708 2.48802 0.292708C1.27558 0.292708 0.292708 1.27558 0.292708 2.48802C0.292708 3.70046 1.27558 4.68333 2.48802 4.68333Z" />
                    </Icon>
                    <T k="search" className="beam-files__placeholder">Search all files</T>
                  </span>
                  <Icon stroke="none">
                    <rect x="0.292708" y="0.292708" width="6.43958" height="6.43958" rx="2.04896" fill="#fff" stroke="#8F8F8F" strokeWidth="0.585417" />
                    <path d="M2.34167 5.85415L4.0814 1.17082H4.68333L2.9436 5.85415H2.34167Z" fill="#8F8F8F" />
                  </Icon>
                </div>
                <div className="beam-files__new-folder">
                  <span className="beam-files__with-icon">
                    <Icon box="-0.147 -0.4395 7.025 7.025">
                      <path d="M1.46372 1.17083H3.14035L2.96589 0.798508C2.8213 0.489994 2.51161 0.292708 2.1709 0.292708H1.17101C0.686282 0.292708 0.292882 0.686108 0.292882 1.17083V2.34167C0.292882 1.69478 0.81683 1.17083 1.46372 1.17083Z" fill="#0A0A0A" stroke="none" />
                      <path d="M6.43958 4.68334H4.09792" />
                      <path d="M5.26875 5.85417V3.51251" />
                      <path d="M0.292882 2.34167V1.17083C0.292882 0.685857 0.68603 0.292708 1.17101 0.292708H2.17181C2.51718 0.292708 2.83048 0.495157 2.97239 0.810029L3.06555 1.01673" />
                      <path d="M6.43958 2.63438V2.34167C6.43958 1.69504 5.9154 1.17084 5.26875 1.17084H1.46354C0.816908 1.17084 0.292708 1.69504 0.292708 2.34167V4.39063C0.292708 5.03727 0.816908 5.56147 1.46354 5.56147H2.92708" />
                    </Icon>
                    <T k="newFolder">New folder</T>
                  </span>
                </div>
              </div>
              <div className="beam-files__folders">
                {FOLDERS.map(folder => (
                  <div key={folder.name} className={`beam-files__folder beam-files__folder--${folder.tone}`}>
                    <T k={`folder.${folder.name}`}>{folder.name}</T>
                    <T k={`count.${folder.count}`} className="beam-files__black">{folder.count}</T>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="beam-files__sidebar-bottom">
            <div className="beam-files__links">
              <div className="beam-files__link">
                <Icon>
                  <path d="M4.39063 2.63438H4.39355M4.39063 4.39063C5.36058 4.39063 6.14688 3.60433 6.14688 2.63438C6.14688 1.66442 5.36058 0.878125 4.39063 0.878125C3.42067 0.878125 2.63438 1.66442 2.63438 2.63438C2.63438 2.71448 2.63974 2.79334 2.65013 2.8706C2.66721 2.99768 2.67575 3.06122 2.67 3.10142C2.66401 3.14329 2.65639 3.16586 2.63575 3.20279C2.61593 3.23823 2.58102 3.27315 2.51118 3.34298L1.0153 4.83887C0.964672 4.88949 0.93936 4.91481 0.921259 4.94435C0.90521 4.97054 0.893383 4.99909 0.886213 5.02895C0.878125 5.06264 0.878125 5.09844 0.878125 5.17003V5.67854C0.878125 5.84247 0.878125 5.92444 0.910028 5.98705C0.938091 6.04213 0.98287 6.08691 1.03795 6.11497C1.10056 6.14688 1.18253 6.14688 1.34646 6.14688H1.85497C1.92656 6.14688 1.96236 6.14688 1.99605 6.13879C2.02591 6.13162 2.05447 6.11979 2.08065 6.10374C2.11019 6.08564 2.13551 6.06033 2.18613 6.0097L3.68202 4.51382C3.75185 4.44398 3.78677 4.40907 3.82222 4.38925C3.85914 4.36861 3.88171 4.36099 3.92358 4.355C3.96378 4.34925 4.02732 4.35779 4.1544 4.37487C4.23166 4.38526 4.31052 4.39063 4.39063 4.39063Z" />
                </Icon>
                <T k="apiKeys">API Keys</T>
              </div>
              <div className="beam-files__link">
                <Icon>
                  <path d="M2.75003 5.67009L2.9211 6.05483C2.97195 6.16936 3.05495 6.26668 3.16001 6.33497C3.26508 6.40326 3.38771 6.4396 3.51302 6.43958C3.63833 6.4396 3.76096 6.40326 3.86602 6.33497C3.97109 6.26668 4.05408 6.16936 4.10494 6.05483L4.27601 5.67009C4.33691 5.53356 4.43934 5.41975 4.56872 5.34485C4.69891 5.26976 4.84952 5.23777 4.999 5.25346L5.41757 5.29802C5.54217 5.3112 5.66792 5.28795 5.77956 5.23109C5.89121 5.17423 5.98396 5.08619 6.04657 4.97767C6.10926 4.86921 6.13913 4.74488 6.13255 4.61978C6.12597 4.49468 6.08322 4.37418 6.0095 4.27289L5.76167 3.93237C5.67342 3.81022 5.62627 3.66319 5.62702 3.5125C5.627 3.36222 5.67459 3.2158 5.76297 3.09425L6.0108 2.75374C6.08452 2.65245 6.12727 2.53195 6.13385 2.40685C6.14043 2.28174 6.11056 2.15742 6.04787 2.04896C5.98526 1.94043 5.89251 1.8524 5.78086 1.79554C5.66922 1.73868 5.54347 1.71543 5.41888 1.72861L5.0003 1.77316C4.85083 1.78886 4.70021 1.75687 4.57002 1.68177C4.44039 1.60646 4.33792 1.49204 4.27731 1.35491L4.10494 0.970166C4.05408 0.855637 3.97109 0.758324 3.86602 0.69003C3.76096 0.621737 3.63833 0.585396 3.51302 0.585417C3.38771 0.585396 3.26508 0.621737 3.16001 0.69003C3.05495 0.758324 2.97195 0.855637 2.9211 0.970166L2.75003 1.35491C2.68941 1.49204 2.58695 1.60646 2.45732 1.68177C2.32712 1.75687 2.17651 1.78886 2.02704 1.77316L1.60716 1.72861C1.48256 1.71543 1.35682 1.73868 1.24517 1.79554C1.13353 1.8524 1.04078 1.94043 0.978164 2.04896C0.915472 2.15742 0.885605 2.28174 0.892186 2.40685C0.898767 2.53195 0.941514 2.65245 1.01524 2.75374L1.26307 3.09425C1.35145 3.2158 1.39904 3.36222 1.39901 3.5125C1.39904 3.66278 1.35145 3.8092 1.26307 3.93075L1.01524 4.27127C0.941514 4.37255 0.898767 4.49305 0.892186 4.61816C0.885605 4.74326 0.915472 4.86758 0.978164 4.97604C1.04084 5.08451 1.1336 5.1725 1.24523 5.22935C1.35686 5.2862 1.48257 5.30949 1.60716 5.2964L2.02573 5.25184C2.17521 5.23614 2.32582 5.26813 2.45602 5.34323C2.58613 5.41833 2.68907 5.53277 2.75003 5.67009Z" />
                  <path d="M3.5125 4.39063C3.99747 4.39063 4.39062 3.99748 4.39062 3.5125C4.39062 3.02753 3.99747 2.63438 3.5125 2.63438C3.02752 2.63438 2.63437 3.02753 2.63437 3.5125C2.63437 3.99748 3.02752 4.39063 3.5125 4.39063Z" />
                </Icon>
                <T k="settings">Settings</T>
              </div>
            </div>
            <div className="beam-files__user">
              <div className="beam-files__link">
                <span className="beam-files__avatar"><img src={avatar} alt="" width="128" height="128" decoding="async" /></span>
                <T k="user" className="beam-files__user-name">Michele J.</T>
                <Icon stroke="#7A7A7A"><path d="M0.731771 2.78076L3.5125 4.82972L6.29323 2.78076" /></Icon>
              </div>
            </div>
          </div>
        </aside>

        <main className="beam-files__main">
          <div className="beam-files__title"><T k="title" className="beam-files__black">My Beam</T></div>
          <div className="beam-files__content">
            <div className="beam-files__list">
              <div className="beam-files__table">
                <div className="beam-files__row beam-files__row--head">
                  <span className="beam-files__cell beam-files__cell--name"><T k="head.name">Name</T></span>
                  <span className="beam-files__cell beam-files__cell--size"><T k="head.size" className="beam-files__size-head">Size</T></span>
                  <span className="beam-files__cell beam-files__cell--modified"><T k="head.modified">Modified</T></span>
                  <span className="beam-files__cell beam-files__cell--more" />
                </div>
                {FILES.map(([name, size, modified], index) => (
                  <div key={name} className="beam-files__row">
                    <span className="beam-files__cell beam-files__cell--name">
                      <T k={`file.${name}`}>{name}</T>
                      {index === 0 && <span className="beam-files__badge"><T k="badge">Starter</T></span>}
                    </span>
                    <span className="beam-files__cell beam-files__cell--size"><T k={`size.${size}`}>{size}</T></span>
                    <span className="beam-files__cell beam-files__cell--modified"><T k={`modified.${modified}`}>{modified}</T></span>
                    <span className="beam-files__cell beam-files__cell--more"><MoreIcon /></span>
                  </div>
                ))}
              </div>
              <div className="beam-files__pagination">
                <div className="beam-files__per-page">
                  <T k="perPage" className="beam-files__muted">Row per page</T>
                  <span className="beam-files__page-control"><T k="page.10">10</T><Chevron /></span>
                </div>
                <div className="beam-files__pages">
                  <span className="beam-files__page-control">
                    <Icon stroke="#C2C2C2"><path d="M4.24609 6.29322L2.19714 3.5125L4.24609 0.731767" /></Icon>
                    <T k="previous" className="beam-files__disabled">Previous</T>
                  </span>
                  {['1', '2', '3', '...'].map(page => <span key={page} className="beam-files__page"><T k={`page.${page}`}>{page}</T></span>)}
                  <span className="beam-files__page-control">
                    <T k="next">Next</T>
                    <Icon stroke="#7A7A7A"><path d="M2.48724 6.00052L4.97526 3.5125L2.48724 1.02448" /></Icon>
                  </span>
                </div>
              </div>
            </div>
            <div className="beam-files__stats">
              {STATS.map(([label, value]) => (
                <div key={label} className="beam-files__stat">
                  <T k={`stat.${label}`}>{label}</T>
                  <T k={`stat.${label}.value`}>{value}</T>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
