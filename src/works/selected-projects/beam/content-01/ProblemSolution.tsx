import { useLayoutEffect, useRef, useState } from 'react';
import { setSolutionVisualProgress, SolutionVisual } from './SolutionVisual';
import { T } from './text';
import featureGit from './assets/feature-git.svg';
import featureSecrets from './assets/feature-secrets.svg';
import featureColdstart from './assets/feature-coldstart.svg';
import featureAgents from './assets/feature-agents.svg';
import './ProblemSolution.css';

// Content 01: Beam's "Problem → Solution" section (Motion Lab beam-content/motion-01), in
// code, at the size the gallery showed its export at (1200 × 756, the section's desktop
// layout) and in the export's loop mode. The loop is the lab's, without GSAP: 4.5s on the
// problem, 2.5s to the solution, 2s there, 2.5s back, driving the same timeline (problem
// out over 0.25–0.5, solution in over 0.4–0.65, both linear) and the same visual progress.
// Like the lab's, it runs only while the section is on screen and the tab is visible, and
// under reduced motion it rests on the problem state. Text is outlines (./text).

const PROBLEM_HOLD_SECONDS = 4.5;
const SOLUTION_HOLD_SECONDS = 2;
const AUTO_TRANSITION_SECONDS = 2.5;
const LOOP_SECONDS = PROBLEM_HOLD_SECONDS + AUTO_TRANSITION_SECONDS + SOLUTION_HOLD_SECONDS + AUTO_TRANSITION_SECONDS;

const problemFeatures = [
  { icon: featureGit, title: 'Git isn’t sync', description: 'You need temporary commits\njust to move unfinished work.' },
  { icon: featureSecrets, title: 'Secrets don’t travel', description: 'Your code arrives, but the\nenvironment it needs often\ndoesn’t.' },
  { icon: featureColdstart, title: 'Cold starts are slow', description: 'Repositories and dependencies\nmust be rebuilt before real\nwork can begin.' },
  { icon: featureAgents, title: 'Agents repeat the cycle', description: 'Ephemeral environments repeat\nsetup for every agent.' },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** The loop's playhead (the lab timeline's progress) at `time` seconds into the loop. */
function playheadAt(time: number) {
  const t = ((time % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  if (t < PROBLEM_HOLD_SECONDS) return 0;
  if (t < PROBLEM_HOLD_SECONDS + AUTO_TRANSITION_SECONDS) return (t - PROBLEM_HOLD_SECONDS) / AUTO_TRANSITION_SECONDS;
  if (t < PROBLEM_HOLD_SECONDS + AUTO_TRANSITION_SECONDS + SOLUTION_HOLD_SECONDS) return 1;
  return 1 - (t - PROBLEM_HOLD_SECONDS - AUTO_TRANSITION_SECONDS - SOLUTION_HOLD_SECONDS) / AUTO_TRANSITION_SECONDS;
}

function useReducedMotion() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduced;
}

export default function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    if (!section || !visual) return;
    const problemElements = [...section.querySelectorAll<HTMLElement>('[data-problem-state]')];
    const solutionElements = [...section.querySelectorAll<HTMLElement>('[data-solution-state]')];
    const offset = reducedMotion ? 0 : 8;
    const blur = reducedMotion ? 0 : 4;
    let showingSolution = false;

    // One set of elements at `amount` of the way from shown (0) to hidden (1), moving
    // `direction` (up for the leaving problem, from below for the arriving solution).
    const place = (elements: HTMLElement[], hidden: number, y: number) => {
      for (const element of elements) {
        element.style.opacity = String(1 - hidden);
        element.style.visibility = hidden >= 1 ? 'hidden' : 'inherit';
        element.style.transform = `translate(0px, ${y}px)`;
        element.style.filter = `blur(${hidden * blur}px)`;
      }
    };
    const setAccessibleState = (solutionIsVisible: boolean) => {
      if (showingSolution === solutionIsVisible) return;
      showingSolution = solutionIsVisible;
      problemElements.forEach(element => element.setAttribute('aria-hidden', String(solutionIsVisible)));
      solutionElements.forEach(element => element.setAttribute('aria-hidden', String(!solutionIsVisible)));
    };
    const render = (progress: number) => {
      const out = clamp((progress - 0.25) / 0.25);
      const into = clamp((progress - 0.4) / 0.25);
      place(problemElements, out, -offset * out);
      place(solutionElements, 1 - into, offset * (1 - into));
      setAccessibleState(progress >= 0.45);
      setSolutionVisualProgress(visual, clamp((progress - 0.25) / 0.4), reducedMotion);
    };
    render(0);
    if (reducedMotion) return;

    let time = 0;
    let last = 0;
    let frame = 0;
    let shown = 0;
    let inView = false;
    const tick = (now: number) => {
      if (last) time += (now - last) / 1000;
      last = now;
      const progress = playheadAt(time);
      if (progress !== shown) {
        shown = progress;
        render(progress);
      }
      frame = requestAnimationFrame(tick);
    };
    // Paused off screen or in a hidden tab, and resumed from the same moment.
    const sync = () => {
      const run = inView && !document.hidden;
      if (run && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      sync();
    }, { threshold: 0.08 });
    observer.observe(section);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="beam-problem-solution">
      <div className="beam-ps-column">
        <div className="beam-ps-title">
          <h2 data-problem-state><T k="title-problem">Your workflow breaks between environments.</T></h2>
          <h2 data-solution-state aria-hidden="true"><T k="title-solution">One workspace. Every environment.</T></h2>
        </div>
        <div className="beam-ps-visual">
          <SolutionVisual ref={visualRef} reducedMotion={reducedMotion} />
        </div>
        <div className="beam-ps-details">
          <div data-problem-state className="beam-ps-problems" role="region" aria-label="Workflow problems">
            {problemFeatures.map((feature, index) => (
              <div key={feature.title} className="beam-ps-feature">
                <span className="beam-ps-feature-icon"><img src={feature.icon} alt="" /></span>
                <span className="beam-ps-feature-text">
                  <T k={`feature-${index + 1}-title`}>{feature.title}</T>
                  <span className="beam-ps-feature-description"><T k={`feature-${index + 1}-description`}>{feature.description}</T></span>
                </span>
              </div>
            ))}
          </div>
          <div data-solution-state aria-hidden="true" className="beam-ps-solution">
            <p><T k="solution">{'One unified directory, mirrored everywhere.\nAttach it to any machine and your workspace is just there.\nFiles on demand, secrets included, and the same\nview for agents through CLI and MCP.'}</T></p>
          </div>
        </div>
      </div>
    </section>
  );
}
