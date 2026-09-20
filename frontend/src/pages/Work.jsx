import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Work.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper to format numbers with leading zero
const formatNumber = (num) => {
  return String(num).padStart(2, '0');
};

export default function Work() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('all'); // Track active filter

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Group projects by section
  const sections = {};
  const unsectioned = [];

  projects.forEach((project) => {
    if (project.section) {
      const key = project.section.slug || project.section.name;

      if (!sections[key]) {
        sections[key] = {
          name: project.section.name,
          slug: key,
          projects: [],
        };
      }

      sections[key].projects.push(project);
    } else {
      unsectioned.push(project);
    }
  });

  const sectionEntries = Object.values(sections);

  // Filter projects based on active section
  const getFilteredProjects = () => {
    if (activeSection === 'all') {
      // Return all projects (including unsectioned)
      return {
        sectionEntries: sectionEntries,
        unsectioned: unsectioned,
        showAll: true
      };
    } else {
      // Find the selected section
      const selected = sectionEntries.find(s => s.slug === activeSection);
      return {
        sectionEntries: selected ? [selected] : [],
        unsectioned: [],
        showAll: false
      };
    }
  };

  // Scroll to section when clicking filter
  const scrollToSection = (slug) => {
    setActiveSection(slug);
    
    if (slug === 'all') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    // Small delay to allow state update and DOM re-render
    setTimeout(() => {
      const element = document.getElementById(`section-${slug}`);
      if (element) {
        const headerOffset = 90;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const { sectionEntries: filteredSections, unsectioned: filteredUnsectioned, showAll } = getFilteredProjects();

  // Calculate total project count for numbering
  let globalIndex = 0;

  return (
    <main className="work-page">

      {/* =========================
          TOP NAVIGATION
      ========================= */}
      <header
        className={`work-topbar ${
          isVisible ? 'work-topbar--visible' : ''
        }`}
      >
       

        {/* Section List - Filter Buttons */}
        <nav className="work-section-nav" aria-label="Work sections">

          <button
            type="button"
            className={`work-section-nav__item ${
              activeSection === 'all' ? 'work-section-nav__item--active' : ''
            }`}
            onClick={() => scrollToSection('all')}
          >
            All Works
          </button>

          {sectionEntries.map((section) => (
            <button
              type="button"
              className={`work-section-nav__item ${
                activeSection === section.slug ? 'work-section-nav__item--active' : ''
              }`}
              key={section.slug}
              onClick={() => scrollToSection(section.slug)}
            >
              {section.name}
            </button>
          ))}
        </nav>
      </header>

      {/* =========================
          PROJECT SECTIONS (Filtered)
      ========================= */}
      {filteredSections.map((section, sIndex) => (
        <section
          id={`section-${section.slug}`}
          className={`work-section ${
            isVisible ? 'work-section--visible' : ''
          }`}
          key={section.slug}
          style={{
            '--section-delay': `${sIndex * 150}ms`,
          }}
        >
          {/* Show section title when filtering */}
          {!showAll && (
            <h2 className="work-section-title">{section.name}</h2>
          )}
          
          <div className="work-grid">
            {section.projects.map((project, pIndex) => {
              globalIndex += 1;
              const projectNumber = formatNumber(globalIndex);

              return (
                <Link
                  to={`/work/${project.slug}`}
                  className={`work-card ${
                    isVisible ? 'work-card--visible' : ''
                  }`}
                  key={project.id || project._id}
                  style={{
                    '--card-delay': `${
                      sIndex * 150 + pIndex * 80
                    }ms`,
                  }}
                >
                  <div className="work-card__frame">
                    <img
                      src={project.coverImageUrl}
                      alt={project.title}
                      loading="lazy"
                    />
                    <div className="work-card__number-badge">
                      <span className="work-card__number">
                        {projectNumber}
                      </span>
                    </div>
                    <div className="work-card__name-overlay">
                      <span className="work-card__name">
                        {project.title}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {/* =========================
          UNSECTIONED PROJECTS (only show when "All Works" is active)
      ========================= */}
      {showAll && filteredUnsectioned.length > 0 && (
        <section
          id="section-other"
          className={`work-section ${
            isVisible ? 'work-section--visible' : ''
          }`}
          style={{
            '--section-delay': `${sectionEntries.length * 150}ms`,
          }}
        >
          <h2 className="work-section-title">Other Projects</h2>
          <div className="work-grid">
            {filteredUnsectioned.map((project, pIndex) => {
              globalIndex += 1;
              const projectNumber = formatNumber(globalIndex);

              return (
                <Link
                  to={`/work/${project.slug}`}
                  className={`work-card ${
                    isVisible ? 'work-card--visible' : ''
                  }`}
                  key={project.id || project._id}
                  style={{
                    '--card-delay': `${
                      sectionEntries.length * 150 +
                      pIndex * 80
                    }ms`,
                  }}
                >
                  <div className="work-card__frame">
                    <img
                      src={project.coverImageUrl}
                      alt={project.title}
                      loading="lazy"
                    />
                    <div className="work-card__number-badge">
                      <span className="work-card__number">
                        {projectNumber}
                      </span>
                    </div>
                    <div className="work-card__name-overlay">
                      <span className="work-card__name">
                        {project.title}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}