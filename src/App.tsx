import ContactFooter from './components/ContactFooter';
import Header from './components/Header';
import Intro from './components/Intro';
import Works from './components/Works';

export default function App() {
  return (
    <main className="portfolio">
      <Header />
      <Intro />
      <div className="foreground-layer">
        <Works />
        <ContactFooter />
      </div>
    </main>
  );
}
