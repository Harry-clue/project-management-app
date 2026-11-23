import { useEffect, useState } from 'react';
import './App.css';

const PROFILE = {
  name: 'Harrison Nganga',
  role: 'Software Engineer',
  location: 'Nairobi, Kenya',
  availability: 'Open to opportunities',
  bio: 'I build fast, accessible web applications and developer tools. Focused on clean architecture, intuitive interfaces, and solving real-world problems with modern JavaScript and backend technologies.',
  skills: ['React',  'Node.js', 'CSS','Tailwind'],
  links: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'harrisonnganga760@gmail.com',
  },
};

const PROJECTS = [
  {
    id: 1,
    title: 'Charity Website',
    category: 'web',
    icon: '',
    description: 'A responsive charity website built with semantic HTML and custom CSS.',
    tags: ['HTML', 'CSS'],
    liveUrl: '#',
    codeUrl: '#',
  },
  {
    id: 2,
    title: 'Calculator',
    category: 'web',
    icon: '',
    description: 'A simple interactive calculator built with JavaScript.',
    tags: ['JavaScript'],
    liveUrl: '#',
    codeUrl: '#',
  },
  {
    id: 3,
    title: 'Portfolio Website',
    category: 'web',
    icon: '',
    description: 'A personal portfolio showcasing projects, built with JavaScript and CSS.',
    tags: ['JavaScript', 'CSS'],
    liveUrl: '#',
    codeUrl: '#',
  },
  {
    id: 4,
    title: 'Dictionary',
    category: 'web',
    icon: '',
    description: 'A dictionary app for looking up words, built with HTML, CSS, and JavaScript.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://harry-clue.github.io/my-portfolio/',
    codeUrl: '#',
  },
];

const STORAGE_KEY = 'portfolio-projects';
const PROJECTS_MIGRATION_KEY = 'portfolio-projects-replaced-defaults-v1';
const PROJECT_ICONS_MIGRATION_KEY = 'portfolio-project-default-icons-removed-v1';
const NEW_PROJECT = Symbol('new-project');

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web Apps' },
  { id: 'tool', label: 'CLI / Tools' },
  { id: 'design', label: 'UI Design' },
];

const EMPTY_PROJECT = {
  title: '',
  category: 'web',
  icon: '',
  description: '',
  tags: [],
  liveUrl: '',
  codeUrl: '',
};

function isProjectList(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (project) =>
        project &&
        (typeof project.id === 'string' || typeof project.id === 'number') &&
        typeof project.title === 'string' &&
        typeof project.category === 'string' &&
        typeof project.icon === 'string' &&
        typeof project.description === 'string' &&
        Array.isArray(project.tags) &&
        project.tags.every((tag) => typeof tag === 'string') &&
        typeof project.liveUrl === 'string' &&
        typeof project.codeUrl === 'string',
    )
  );
}

function loadProjects() {
  try {
    const savedProjects = window.localStorage.getItem(STORAGE_KEY);
    if (savedProjects === null) return PROJECTS;

    const parsedProjects = JSON.parse(savedProjects);
    if (!isProjectList(parsedProjects)) return PROJECTS;
    let projectsToLoad = parsedProjects;
    if (window.localStorage.getItem(PROJECTS_MIGRATION_KEY) !== 'true') {
      const customProjects = parsedProjects.filter(
        (project) =>
          !(typeof project.id === 'number' && project.id >= 1 && project.id <= 4),
      );
      projectsToLoad = [...PROJECTS, ...customProjects];
      window.localStorage.setItem(PROJECTS_MIGRATION_KEY, 'true');
    }

    if (window.localStorage.getItem(PROJECT_ICONS_MIGRATION_KEY) !== 'true') {
      projectsToLoad = projectsToLoad.map((project) =>
        typeof project.id === 'number' && project.id >= 1 && project.id <= 4
          ? { ...project, icon: '' }
          : project,
      );
      window.localStorage.setItem(PROJECT_ICONS_MIGRATION_KEY, 'true');
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsToLoad));
    return projectsToLoad;
  } catch {
    return PROJECTS;
  }
}

export default function App() {
  const [projects, setProjects] = useState(loadProjects);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightMode, setLightMode] = useState(false);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    if (editingId === null) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') setEditingId(null);
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [editingId]);

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      activeCategory === 'all' || project.category === activeCategory;
    const searchableText = [
      project.title,
      project.description,
      ...project.tags,
    ]
      .join(' ')
      .toLocaleLowerCase();
    return matchesCategory && searchableText.includes(normalizedQuery);
  });

  function openProjectForm(project = null) {
    setProjectForm(
      project
        ? { ...project, tags: [...project.tags] }
        : { ...EMPTY_PROJECT },
    );
    setEditingId(project?.id ?? NEW_PROJECT);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setProjectForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function persistProjects(nextProjects) {
    setProjects(nextProjects);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
      window.localStorage.setItem(PROJECTS_MIGRATION_KEY, 'true');
      window.localStorage.setItem(PROJECT_ICONS_MIGRATION_KEY, 'true');
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function handleProjectSubmit(event) {
    event.preventDefault();

    const project = {
      ...projectForm,
      title: projectForm.title.trim(),
      icon: projectForm.icon.trim(),
      description: projectForm.description.trim(),
      tags:
        typeof projectForm.tags === 'string'
          ? projectForm.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : projectForm.tags,
      liveUrl: projectForm.liveUrl.trim(),
      codeUrl: projectForm.codeUrl.trim(),
    };

    if (editingId === NEW_PROJECT) {
      const nextId =
        projects.reduce(
          (highestId, currentProject) =>
            typeof currentProject.id === 'number'
              ? Math.max(highestId, currentProject.id)
              : highestId,
          0,
        ) + 1;
      persistProjects([...projects, { ...project, id: nextId }]);
    } else {
      persistProjects(
        projects.map((currentProject) =>
          currentProject.id === editingId ? { ...project, id: editingId } : currentProject,
        ),
      );
    }

    setEditingId(null);
  }

  function deleteProject(project) {
    if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      persistProjects(
        projects.filter((currentProject) => currentProject.id !== project.id),
      );
    }
  }

  return (
    <div className={`app ${lightMode ? 'light-theme' : ''}`}>
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#" className="brand">
            <span>&lt;</span>{PROFILE.name}<span>/&gt;</span>
          </a>

          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <button
              className="theme-btn"
              onClick={() => setLightMode(!lightMode)}
              aria-label="Toggle theme"
            >
              {lightMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <section id="about" className="hero">
          <div className="status-badge">
            <span className="status-dot"></span>
            {PROFILE.availability} · {PROFILE.location}
          </div>

          <h1>
            Hi, I&apos;m {PROFILE.name}.
            <span className="hero-role">{PROFILE.role}</span>
          </h1>

          <p className="hero-bio">{PROFILE.bio}</p>

          <div className="skills">
            {PROFILE.skills.map((skill) => (
              <span key={skill} className="skill-pill">
                {skill}
              </span>
            ))}
          </div>

          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View Projects ↓
            </a>
            <a href={PROFILE.links.github} target="_blank" rel="noreferrer" className="btn">
              GitHub ↗
            </a>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer" className="btn">
              LinkedIn ↗
            </a>
            <a href={PROFILE.links.email} className="btn">
              Email Me
            </a>
          </div>
        </section>

        <section id="projects">
          <div className="section-header">
            <div>
              <h2>Featured Projects</h2>
              <p>Selected personal builds, tools, and experiments.</p>
            </div>
            <div className="project-header-actions">
              <button className="btn btn-primary" onClick={() => openProjectForm()}>
                + New Project
              </button>
              <button className="btn reset-btn" onClick={() => persistProjects(PROJECTS)}>
                Reset Defaults
              </button>
            </div>
          </div>

          <div className="project-controls">
            <label className="search-field">
              <span className="visually-hidden">Search projects</span>
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects..."
              />
            </label>

            <div className="filters" aria-label="Filter projects by category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  aria-pressed={activeCategory === cat.id}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {storageError && (
            <p className="storage-error" role="alert">
              Your projects could not be saved in this browser. Check available storage and try again.
            </p>
          )}

          {filteredProjects.length > 0 ? (
            <div className="grid">
              {filteredProjects.map((project) => {
                const categoryLabel =
                  CATEGORIES.find((category) => category.id === project.category)?.label ??
                  project.category;
                return (
                  <article key={project.id} className="card">
                    {project.icon && <div className="card-banner">{project.icon}</div>}

                    <div className="card-body">
                      <span className="card-category">{categoryLabel}</span>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>

                      <div className="card-tags">
                        {project.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="card-actions">
                        <a href={project.liveUrl || undefined} target="_blank" rel="noreferrer" className="btn btn-primary">
                          Live Demo
                        </a>
                        <a href={project.codeUrl || undefined} target="_blank" rel="noreferrer" className="btn">
                          Source Code
                        </a>
                      </div>
                      <div className="card-manage-actions">
                        <button className="btn" onClick={() => openProjectForm(project)}>
                          Edit
                        </button>
                        <button className="btn delete-btn" onClick={() => deleteProject(project)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">⌕</span>
              <h3>No projects found</h3>
              <p>Try a different search or category filter.</p>
            </div>
          )}
        </section>
      </div>

      {editingId !== null && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingId(null);
          }}
        >
          <section
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="project-modal-title">
                  {editingId === NEW_PROJECT ? 'New Project' : 'Edit Project'}
                </h2>
                <p>Add the details you want to show on your portfolio.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingId(null)}
                aria-label="Close project form"
              >
                ×
              </button>
            </div>

            <form className="project-form" onSubmit={handleProjectSubmit}>
              <label>
                Title
                <input
                  name="title"
                  value={projectForm.title}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    name="category"
                    value={projectForm.category}
                    onChange={handleFormChange}
                  >
                    {CATEGORIES.filter((category) => category.id !== 'all').map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Icon / Emoji
                  <input
                    name="icon"
                    value={projectForm.icon}
                    onChange={handleFormChange}
                    placeholder="Optional"
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleFormChange}
                  rows="3"
                  required
                />
              </label>

              <label>
                Tech Tags <span className="field-hint">(comma-separated)</span>
                <input
                  name="tags"
                  value={Array.isArray(projectForm.tags) ? projectForm.tags.join(', ') : projectForm.tags}
                  onChange={handleFormChange}
                  placeholder="React, CSS, API"
                />
              </label>

              <div className="form-row">
                <label>
                  Live URL
                  <input
                    name="liveUrl"
                    type="text"
                    inputMode="url"
                    value={projectForm.liveUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com"
                  />
                </label>
                <label>
                  Source Code URL
                  <input
                    name="codeUrl"
                    type="text"
                    inputMode="url"
                    value={projectForm.codeUrl}
                    onChange={handleFormChange}
                    placeholder="https://github.com/..."
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId === NEW_PROJECT ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
