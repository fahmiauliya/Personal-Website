import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, Download, File, Folder, MoreHorizontal, Search, Share2, X } from './icons';
import { files, folders, formatBytes, formatModified } from './data';
import { positionAtTime } from './timeline';
import { T } from './text';
import personalLogo from './assets/personal.svg';
import newFolderIcon from './assets/new-folder.svg';
import styles from './WorkspaceDemo.module.css';

// Motion Lab's HeroWorkspaceDemo (beam-content/motion-03/product-demo) as the gallery shows it:
// its loop, view-only. The lab's version is a working file manager (search, uploads, menus,
// dialogs); the loop only ever shows four states, so this keeps those: My Beam, Folder 001,
// its first file selected, and that file open in the preview, with the demo cursor moving and
// clicking between them. Same markup and classes as the lab's, so its CSS (WorkspaceDemo.
// module.css) applies as it is. The loop runs while `playing`, from where it paused. It's
// decoration (inert): nothing in it can be focused or clicked, as in the gallery's iframe.

type Stage = 'home' | 'folder' | 'selected' | 'preview';

const CURSOR_POINTS = [
  { at: 0, x: 410, y: 184, opacity: 0 },
  { at: 0.035, x: 410, y: 184, opacity: 1 },
  { at: 0.2, x: 71, y: 130, opacity: 1 },
  { at: 0.26, x: 71, y: 130, opacity: 1 },
  { at: 0.44, x: 284, y: 80, opacity: 1 },
  { at: 0.55, x: 284, y: 80, opacity: 1 },
  { at: 0.65, x: 284, y: 80, opacity: 1 },
  { at: 0.78, x: 24, y: 22, opacity: 1 },
  { at: 0.9, x: 235, y: 22, opacity: 1 },
  { at: 0.97, x: 410, y: 184, opacity: 0 },
  { at: 1, x: 410, y: 184, opacity: 0 },
];
const CLICKS = [0.2, 0.44, 0.55, 0.78, 0.9];

const stageAt = (position: number): Stage =>
  position < 0.2 || position >= 0.9 ? 'home' : position < 0.44 || position >= 0.78 ? 'folder' : position < 0.55 ? 'selected' : 'preview';

const FOLDER = folders[0];
const FOLDER_FILES = files.filter(file => file.folderId === FOLDER.id);
const SAMPLE = FOLDER_FILES[0];
const STORAGE_USED = formatBytes(files.reduce((total, file) => total + file.size, 0));
// My Beam's folder rows show fixed sizes and dates in the lab, not their files'.
const HOME_ROWS = [['2.4KB', '5 days ago'], ['856MB', '5 days ago'], ['420MB', '6 days ago']];

export default function WorkspaceDemo({ playing }: { playing: boolean }) {
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;
  // Under reduced motion the lab opens Folder 001 and holds it, without the cursor.
  const [stage, setStage] = useState<Stage>(reducedMotion ? 'folder' : 'home');
  const cursorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || reducedMotion || !playing) return;
    let frame = 0;
    let last = 0;
    const render = (rawPosition: number) => {
      const position = Math.min(1, Math.max(0, rawPosition));
      setStage(stageAt(position));
      const nextIndex = CURSOR_POINTS.findIndex(point => point.at >= position);
      const next = CURSOR_POINTS[Math.max(1, nextIndex)];
      const previous = CURSOR_POINTS[Math.max(0, CURSOR_POINTS.indexOf(next) - 1)];
      const fraction = Math.min(1, Math.max(0, (position - previous.at) / (next.at - previous.at)));
      const smooth = fraction * fraction * (3 - 2 * fraction);
      const x = previous.x + (next.x - previous.x) * smooth;
      const y = previous.y + (next.y - previous.y) * smooth;
      const click = CLICKS.reduce((amount, at) => Math.max(amount, Math.max(0, 1 - Math.abs(position - at) / 0.012)), 0);
      cursor.style.transform = `translate(${x - 410}px, ${y - 184}px) scale(${1 - click * 0.22})`;
      cursor.style.opacity = String(previous.opacity + (next.opacity - previous.opacity) * smooth);
    };
    const tick = (now: number) => {
      if (last) timeRef.current += (now - last) / 1000;
      last = now;
      render(positionAtTime(timeRef.current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reducedMotion]);

  const folderOpen = stage !== 'home';

  return (
    <div className={styles.app} inert>
      <aside className={styles.sidebar}>
        <div className={styles.workspaceControl}>
          <button className={styles.workspace} type="button">
            <img className={styles.beamMark} src={personalLogo} alt="" aria-hidden="true" />
            <span className={styles.workspaceLabel}><T k="workspace">Personal</T></span>
            <ChevronDown className={styles.workspaceChevron} size={11} />
          </button>
        </div>
        {/* The lab's search field, showing its placeholder (an outlined label, as an input can't hold one). */}
        <label className={styles.search}><Search size={11} /><span className="beam-hero-placeholder"><T k="search">Search all files</T></span></label>
        <button className={styles.newFolder} type="button"><img src={newFolderIcon} alt="" /><T k="new-folder">New folder</T></button>
        <nav className={styles.folderList} aria-label="Folders">
          {folders.map(folder => (
            <button className={folderOpen && folder.id === FOLDER.id ? styles.folderActive : styles.folderRow} type="button" key={folder.id}>
              <span><T k={`side:${folder.name}`}>{folder.name}</T></span><span><T k={`count:${folder.id}`}>{String(files.filter(file => file.folderId === folder.id).length)}</T></span>
            </button>
          ))}
        </nav>
      </aside>

      {!reducedMotion && (
        <div ref={cursorRef} className={styles.demoCursor} style={{ left: 410, top: 184 }} aria-hidden="true">
          <svg width="19" height="24" viewBox="0 0 19 24" fill="none"><path d="M1 1v17l4.5-4.5 3.2 7.5 3.1-1.4-3.2-7.4H16L1 1Z" fill="#171717" stroke="white" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </div>
      )}

      <main className={styles.content}>
        <header className={styles.contentHeader}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <button className={styles.crumb} type="button"><T k="crumb:My Beam">My Beam</T></button>
            {folderOpen && <><span><T k="crumb:/">/</T></span><button className={styles.currentCrumb} type="button"><T k="crumb:Folder 001">{FOLDER.name}</T></button></>}
          </nav>
        </header>

        {!folderOpen ? (
          <div className={styles.homeGrid}>
            <div className={styles.table} role="table" aria-label="My Beam folders">
              <TableHeader view="home" />
              {folders.map((folder, index) => (
                <div className={styles.tableRow} role="row" key={folder.id}>
                  <button className={styles.nameButton} type="button"><Folder size={11} /><T k={`row:${folder.name}`}>{folder.name}</T>{index === 0 && <span className={styles.badge}><T k="starter">Starter</T></span>}</button>
                  <span><T k={`cell:${HOME_ROWS[index][0]}`}>{HOME_ROWS[index][0]}</T></span><span><T k={`cell:${HOME_ROWS[index][1]}`}>{HOME_ROWS[index][1]}</T></span>
                  <button className={styles.moreButton} type="button"><MoreHorizontal size={13} /></button>
                </div>
              ))}
            </div>
            <div className={styles.stats}>
              {[['Folders', String(folders.length)], ['Files', String(files.length)], ['Storage used', STORAGE_USED]].map(([label, value]) => (
                <div key={label}><span><T k={`stat:${label}`}>{label}</T></span><span><T k={`stat-value:${label}`}>{value}</T></span></div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.folderView}>
            <div className={styles.table} role="table" aria-label={`${FOLDER.name} files`}>
              <TableHeader view="folder" />
              {FOLDER_FILES.map(file => (
                <div className={`${styles.tableRow} ${stage === 'selected' && file.id === SAMPLE.id ? styles.fileSelected : ''}`} role="row" key={file.id}>
                  <button className={styles.nameButton} type="button"><File size={11} /><T k={`row:${file.name}`}>{file.name}</T></button>
                  <span><T k={`cell:${formatBytes(file.size)}`}>{formatBytes(file.size)}</T></span><span><T k={`cell:${formatModified(file.modified)}`}>{formatModified(file.modified)}</T></span>
                  <button className={styles.moreButton} type="button"><MoreHorizontal size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {stage === 'preview' && (
        <div className={styles.preview}>
          <div className={styles.previewBar}>
            <div className={styles.previewBreadcrumb}><button type="button"><ChevronLeft size={12} /></button><strong><T k="preview-name">{SAMPLE.name}</T></strong></div>
            <div><button type="button"><Share2 size={12} /></button><button type="button"><Download size={12} /></button><button type="button"><X size={13} /></button></div>
          </div>
          <div className={styles.previewBody}><pre><T k="preview-text">{SAMPLE.content!}</T></pre></div>
        </div>
      )}
    </div>
  );
}

// The two tables size their columns differently, so each has its own header text.
function TableHeader({ view }: { view: 'home' | 'folder' }) {
  return (
    <div className={`${styles.tableRow} ${styles.tableHeader}`} role="row">
      <span><T k={`${view}-head:Name`}>Name</T></span><span><T k={`${view}-head:Size`}>Size</T></span><span><T k={`${view}-head:Modified`}>Modified</T></span><span />
    </div>
  );
}
