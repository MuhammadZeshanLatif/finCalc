import { useState, useEffect } from "react";
import { translations } from "./data/translations";
import { blogPosts } from "./data/blogPosts";
import Calculators from "./components/Calculators";

export default function App() {
  const [lang, setLang] = useState<"en" | "ru">("en");
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Blog pagination state
  const [blogPage, setBlogPage] = useState<number>(1);
  const postsPerPage = 6;

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/ru")) {
      setLang("ru");
    } else {
      setLang("en");
    }

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setCurrentPage(hash);
    }
  }, []);

  const changeLang = (newLang: "en" | "ru") => {
    setLang(newLang);
    const path = newLang === "ru" ? "/ru" : "/";
    window.history.pushState({}, "", path);
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  const t = translations[lang];

  const calculatorList = Object.keys(t.calculators).map(key => ({
    id: key,
    title: (t.calculators as any)[key].title,
    desc: (t.calculators as any)[key].desc,
  }));

  const filteredCalculators = calculatorList.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBlogPosts = blogPosts[lang];
  const indexOfLastPost = blogPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const paginatedPosts = currentBlogPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="min-h-screen bg-light text-dark d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => { e.preventDefault(); navigateTo("home"); }}>
            <i className="fa-solid fa-coins text-warning me-2 fs-3"></i>
            <div>
              <span className="fw-bold tracking-tight">{t.siteTitle}</span>
              <small className="d-block text-secondary fs-6 fw-normal">{t.siteSubtitle}</small>
            </div>
          </a>

          <div className="d-flex align-items-center ms-auto">
            <button className={`btn btn-sm me-2 ${lang === "en" ? "btn-warning" : "btn-outline-secondary text-white"}`} onClick={() => changeLang("en")}>
              EN
            </button>
            <button className={`btn btn-sm ${lang === "ru" ? "btn-warning" : "btn-outline-secondary text-white"}`} onClick={() => changeLang("ru")}>
              РУ
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="container my-4 flex-grow-1">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: "20px", zIndex: 10 }}>
              <div className="card-header bg-primary text-white d-flex align-items-center fw-bold">
                <i className="fa-solid fa-bars-staggered me-2"></i> {t.allCalculators}
              </div>
              <div className="p-2 bg-light border-bottom">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {filteredCalculators.map(c => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    onClick={(e) => { e.preventDefault(); navigateTo(c.id); }}
                    className={`list-group-item list-group-item-action border-0 py-2 px-3 d-flex align-items-center ${currentPage === c.id ? "bg-primary-subtle text-primary fw-bold" : ""}`}
                  >
                    <i className="fa-solid fa-chevron-right me-2 small text-secondary"></i>
                    <span className="small">{c.title}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="card shadow-sm border-0 mt-3 p-3 bg-dark text-white text-center">
              <h6 className="mb-1"><i className="fa-solid fa-shield-halved text-warning me-2"></i> AdSense Ready</h6>
              <p className="small text-secondary mb-0">High-quality, SEO-optimized financial tools.</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-lg-9">
            {currentPage === "home" && (
              <div>
                <div className="p-4 bg-white rounded shadow-sm border mb-4 text-center">
                  <h1 className="fw-bold text-dark mb-2">{t.siteTitle}</h1>
                  <p className="text-secondary mb-3">{t.siteSubtitle}</p>
                  <hr className="w-25 mx-auto text-primary" style={{ height: "3px" }} />
                  <p className="text-muted col-md-8 mx-auto">
                    Explore our professional suite of 10+ finance-related calculators. From mortgage planning to complex compound interest and tax thresholds, calculate your projections with natural confidence.
                  </p>
                </div>

                <div className="row g-3">
                  {filteredCalculators.map(c => (
                    <div className="col-md-6" key={c.id}>
                      <div className="card h-100 shadow-sm border-0 calculator-card">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title text-primary d-flex align-items-center">
                            <i className="fa-solid fa-calculator me-2"></i> {c.title}
                          </h5>
                          <p className="card-text text-muted small flex-grow-1">{c.desc}</p>
                          <button onClick={() => navigateTo(c.id)} className="btn btn-outline-primary btn-sm mt-3 w-100 align-self-end">
                            {t.readMore} <i className="fa-solid fa-arrow-right-long ms-1"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render Specific Calculator */}
            {calculatorList.some(c => c.id === currentPage) && (
              <Calculators id={currentPage} lang={lang} />
            )}

            {/* Blog Page */}
            {currentPage === "blog" && (
              <div className="bg-white rounded p-4 shadow-sm border">
                <h2 className="text-primary mb-4 d-flex align-items-center border-bottom pb-2">
                  <i className="fa-solid fa-newspaper me-2"></i> {t.latestPosts}
                </h2>

                <div className="row g-4">
                  {paginatedPosts.map((post: any) => (
                    <div className="col-md-6" key={post.id}>
                      <div className="card h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column">
                          <small className="text-muted d-block mb-2">
                            <i className="fa-regular fa-calendar-days me-1"></i> {post.date}
                          </small>
                          <h5 className="card-title text-dark">{post.title}</h5>
                          <p className="card-text text-secondary small flex-grow-1">{post.desc}</p>
                          <hr />
                          <p className="small text-muted">{post.content}</p>
                          <div className="mt-auto">
                            <button onClick={() => navigateTo(post.calcLink)} className="btn btn-primary btn-sm w-100">
                              <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Try Linked Calculator
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center mt-5">
                  <button
                    className="btn btn-outline-secondary me-2 btn-sm"
                    disabled={blogPage === 1}
                    onClick={() => setBlogPage(prev => prev - 1)}
                  >
                    <i className="fa-solid fa-chevron-left me-1"></i> {t.prev}
                  </button>
                  <span className="mx-3 fw-bold small">Page {blogPage}</span>
                  <button
                    className="btn btn-outline-secondary ms-2 btn-sm"
                    disabled={indexOfLastPost >= currentBlogPosts.length}
                    onClick={() => setBlogPage(prev => prev + 1)}
                  >
                    {t.next} <i className="fa-solid fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Contact Us Page */}
            {currentPage === "contact" && (
              <div className="bg-white rounded p-4 shadow-sm border col-md-8 mx-auto">
                <h2 className="text-primary mb-3 d-flex align-items-center border-bottom pb-2">
                  <i className="fa-solid fa-paper-plane me-2"></i> {t.contact}
                </h2>
                {contactSubmitted ? (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <i className="fa-solid fa-circle-check fs-4 me-2"></i>
                    <div>{t.successMsg}</div>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }}>
                    <div className="mb-3">
                      <label className="form-label">{t.name}</label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t.email}</label>
                      <input type="email" className="form-control" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t.message}</label>
                      <textarea className="form-control" rows={4} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">{t.sendMessage}</button>
                  </form>
                )}
              </div>
            )}

            {/* Privacy Policy */}
            {currentPage === "privacy" && (
              <div className="bg-white rounded p-4 shadow-sm border">
                <h2 className="text-primary mb-3 border-bottom pb-2">Privacy Policy</h2>
                <p>At FinCalc, accessible from fincalc-multipurpose.pro, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by FinCalc and how we use it.</p>
                <h5 className="mt-4">Log Files</h5>
                <p>FinCalc follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
                <h5 className="mt-4">Google DoubleClick DART Cookie</h5>
                <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.</p>
                <h5 className="mt-4">Consent</h5>
                <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
              </div>
            )}

            {/* Terms and Conditions */}
            {currentPage === "terms" && (
              <div className="bg-white rounded p-4 shadow-sm border">
                <h2 className="text-primary mb-3 border-bottom pb-2">Terms and Conditions</h2>
                <p>Welcome to FinCalc! These terms and conditions outline the rules and regulations for the use of FinCalc's Website, located at fincalc-multipurpose.pro.</p>
                <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use FinCalc if you do not agree to take all of the terms and conditions stated on this page.</p>
                <h5 className="mt-4">Cookies</h5>
                <p>We employ the use of cookies. By accessing FinCalc, you agreed to use cookies in agreement with the FinCalc's Privacy Policy.</p>
                <h5 className="mt-4">Disclaimer</h5>
                <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will limit or exclude our or your liability for death or personal injury resulting from negligence.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-auto border-top border-secondary border-opacity-25">
        <div className="container">
          <div className="d-flex justify-content-center flex-wrap gap-3 mb-3">
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo("home"); }} className="text-secondary text-decoration-none small">{t.home}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo("blog"); }} className="text-secondary text-decoration-none small">{t.blog}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo("contact"); }} className="text-secondary text-decoration-none small">{t.contact}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo("privacy"); }} className="text-secondary text-decoration-none small">{t.privacy}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo("terms"); }} className="text-secondary text-decoration-none small">{t.terms}</a>
          </div>
          <p className="text-secondary small mb-0">© 2026 FinCalc. All rights reserved. Calculations are estimates and should not replace professional financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
