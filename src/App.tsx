import { useState } from 'react'
import './App.css'
import WeddingGallery from './WeddingGallery'

function App() {
  const [page, setPage] = useState('welcome')
  const [programmeChoice, setProgrammeChoice] = useState(false)
  const [showHymn, setShowHymn] = useState(false)

  console.log(page)

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="header-brand">
          <img src="/mp-logo.png" alt="Mary and Prince monogram" className="header-logo" />
          <div className="header-brand-copy">
            <span className="header-kicker">THE WEDDING CELEBRATION OF</span>
            <span className="header-title">Mary &amp; Prince</span>
            <span className="header-date">14 NOVEMBER 2026</span>
          </div>
        </div>
      </header>

      <nav className="site-nav" aria-label="Main navigation">
        <button type="button" className={page === 'welcome' && !programmeChoice ? 'nav-link active' : 'nav-link'} onClick={() => { setPage('welcome'); setProgrammeChoice(false) }}>Home</button>
        <button type="button" className={page === 'invitation' ? 'nav-link active' : 'nav-link'} onClick={() => { setPage('invitation'); setProgrammeChoice(false) }}>Invitation</button>
        <button type="button" className={page === 'programme' ? 'nav-link active' : 'nav-link'} onClick={() => { setPage('programme'); setProgrammeChoice(false) }}>Order of Service</button>
        <button type="button" className={page === 'reception' ? 'nav-link active' : 'nav-link'} onClick={() => { setPage('reception'); setProgrammeChoice(false) }}>Reception</button>
        <button type="button" className={page === 'gallery' ? 'nav-link active' : 'nav-link'} onClick={() => { setPage('gallery'); setProgrammeChoice(false) }}>Gallery</button>
      </nav>

      {page === 'welcome' && !programmeChoice && (
        <section className="welcome">
          <img
            src="/mp-logo.png"
            alt="Mary's Prince logo"
            className="logo"
          />

          <h1 className="title">MARY’S PRINCE</h1>

          <p className="subtitle">A UNION BUILT IN FAITH AND LOVE</p>

          <p className="date">14TH NOVEMBER 2026</p>

          <div className="actions">
            <button
              type="button"
              className="button"
              onClick={() => setPage('invitation')}
            >
              VIEW INVITATION
            </button>

            <button
              type="button"
              className="button"
              onClick={() => setProgrammeChoice(true)}
            >
              VIEW PROGRAMME
            </button>

            <button
              type="button"
              className="button"
              onClick={() => setPage('gallery')}
            >
              WEDDING GALLERY
            </button>
          </div>
        </section>
      )}

      {page === 'welcome' && programmeChoice && (
        <section className="programme-choice-page">
          <div className="welcome-content">
            <p className="eyebrow">MARY & PRINCE</p>

            <h1>Our Wedding Programme</h1>

            <p className="welcome-description">
              Kindly select the programme you would like to view.
            </p>

            <div className="actions">
              <button
                type="button"
                className="button"
                onClick={() => {
                  setProgrammeChoice(false)
                  setPage('programme')
                }}
              >
                CHURCH ORDER OF SERVICE
              </button>

              <button
                type="button"
                className="button"
                onClick={() => {
                  setProgrammeChoice(false)
                  setPage('reception')
                }}
              >
                RECEPTION PROGRAMME
              </button>

              <button
                type="button"
                className="button"
                onClick={() => setProgrammeChoice(false)}
              >
                ← BACK
              </button>
            </div>
          </div>
        </section>
      )}
      

      {page === 'invitation' && (
        <section className="invitation">

          <div className="invitation-arch"></div>

          <img
            src="/invitation-decor.png"
            alt=""
            className="invitation-decor"
          />

          <div className="invitation-content">

            <img
              src="/mp-logo.png"
              alt="Mary's Prince monogram"
              className="invitation-logo"
            />

            <p className="invitation-intro">
              TOGETHER WITH
              <br />
              THEIR FAMILIES
            </p>

            <h1 className="couple-names">
              Mary & Prince
            </h1>

            <p className="invitation-message">
              INVITES YOU TO THEIR WEDDING CEREMONY
            </p>

            <div className="wedding-date">

              <div className="date-side">
                <span>SATURDAY</span>
              </div>

              <div className="date-center">
                <span className="month">NOV</span>
                <strong>14</strong>
                <span className="year">2026</span>
              </div>

              <div className="date-side">
                <span>10:00 AM</span>
              </div>

            </div>

            <div className="venue">
              <h2>ASSEMBLIES OF GOD CHURCH</h2>
              <p>
                KARU, NYANYA – JIKWUYI RD. F.C.T. ABUJA
              </p>
            </div>

            <div className="colors">
              <h2>COLORS OF THE DAY</h2>
              <p>
                EMERALD | BURGUNDY | TAN | CHOCOLATE BROWN | GOLD
              </p>
            </div>

            <div className="rsvp">
              <h2>R.S.V.P</h2>

              <p>
                CHIOMA &nbsp; | &nbsp; KINGSLEY
              </p>

              <p>
                <a href="tel:09067766995">
                  0906 776 6995
                </a>

                &nbsp; | &nbsp;

                <a href="tel:08038294446">
                  0803 829 4446
                </a>
              </p>
            </div>

            <button
              type="button"
              className="back-button"
              onClick={() => setPage('welcome')}
            >
              ← BACK
            </button>

          </div>

        </section>
      )}

      
      
      {page === 'programme' && (
  <section className="programme">
    <div className="programme-frame"></div>

    <div className="programme-content">
      

      <h1>ORDER OF THE DAY</h1>

      <h1 className="programme-subtitle">
        MARY & PRINCE
      </h1>

      <div className="programme-divider"></div>

      <h2 className="programme-section-title">
        CHURCH WEDDING
      </h2>

      <div className="service-list">

        <div className="service-item">
          <span className="service-number">01</span>
          <span className="service-event">
            Opening Prayers
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">02</span>
          <span className="service-event">
            Procession
          </span>
        </div>

        <div className="service-item hymn-item">
  <span className="service-number">03</span>

  <div className="service-event">

    <button
      type="button"
      className="hymn-button"
      onClick={() => setShowHymn(!showHymn)}
    >
      <strong>Congregational Hymn</strong>

      <span className="service-note">
        M.O.P 23 — Blessed Assurance
      </span>

      <span className="hymn-toggle">
        {showHymn ? '− CLOSE HYMN' : '+ VIEW HYMN'}
      </span>
    </button>

    {showHymn && (
      <div className="hymn-content">

        <h3>BLESSED ASSURANCE</h3>

        <p>
          <strong>1.</strong> Blessed assurance; Jesus is mine!<br />
          Oh, what a foretaste of glory divine!<br />
          Heir of salvation, purchase of God,<br />
          born of his Spirit, washed in his blood.
        </p>

        <p className="hymn-refrain">
          <strong>Refrain:</strong><br />
          This is my story, this is my song,<br />
          praising my Savior all the day long;<br />
          this is my story, this is my song,<br />
          praising my Savior all the day long.
        </p>

        <p>
          <strong>2.</strong> Perfect submission, perfect delight,<br />
          visions of rapture now burst on my sight;<br />
          angels descending bring from above<br />
          echoes of mercy, whispers of love.
        </p>

        <p className="hymn-refrain">
          <strong>[Refrain]</strong>
        </p>

        <p>
          <strong>3.</strong> Perfect submission, all is at rest,<br />
          I in my Savior am happy and blest;<br />
          watching and waiting, looking above,<br />
          filled with his goodness, lost in his love.
        </p>

        <p className="hymn-refrain">
          <strong>[Refrain]</strong>
        </p>

      </div>
    )}

  </div>
</div>

        <div className="service-item">
          <span className="service-number">04</span>
          <span className="service-event">
            Introduction of Parents & Pastors
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">05</span>
          <span className="service-event">
            Bible Reading
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">06</span>
          <span className="service-event">
            Choir
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">07</span>
          <span className="service-event">
            Sermon
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">08</span>
          <span className="service-event">
            Exchange of Vows and Joining
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">09</span>
          <span className="service-event">
            Signing of Certificate
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">10</span>
          <span className="service-event">
            Thanksgiving Offering
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">11</span>
          <span className="service-event">
            Announcement
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">12</span>
          <span className="service-event">
            Prayer and Benediction
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">13</span>
          <span className="service-event">
            Photography with Officiating Ministers
          </span>
        </div>

        <div className="service-item">
          <span className="service-number">14</span>
          <span className="service-event">
            Recession
          </span>
        </div>

      </div>

  <div className="ministers-section">

  <h2 className="programme-section-title">
    OFFICIATING MINISTERS
  </h2>

  <div className="minister-list">

    <div className="minister-item">
      <span className="minister-number">01</span>

      <div className="minister-details">
        <strong>Rev Dr Sunday Moses</strong>
        <span>Abuja North District Superintendent</span>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">02</span>

      <div className="minister-details">
        <strong>Rev Dr Eugene Nwosu</strong>
        <span>Ukwa District Superintendent</span>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">03</span>

      <div className="minister-details">
        <strong>Rev Kayode Shinkalo</strong>
        <span>Abuja East Ast. District Superintendent</span>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">04</span>

      <div className="minister-details">
        <strong>Rev Dr G.G. Uche</strong>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">05</span>

      <div className="minister-details">
        <strong>Rev Sunday Ogizi</strong>
        <span>Presbyter Abuja East District <br /> (Leader of Service)</span>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">06</span>

      <div className="minister-details">
        <strong>Rev Sunday Onyekwe</strong>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">07</span>

      <div className="minister-details">
        <strong>Rev Joseph Okorochukwu</strong>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">08</span>

      <div className="minister-details">
        <strong>Rev Sunday Robert</strong>
        <span>Bible Reading</span>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">09</span>

      <div className="minister-details">
        <strong>Rev Joseph Ogbu</strong>
      </div>
    </div>

    <div className="minister-item">
      <span className="minister-number">10</span>

      <div className="minister-details">
        <strong>Rev Peter Alabi</strong>
      </div>
    </div>

    <div className="minister-item minister-other">
      <span className="minister-number">11</span>

      <div className="minister-details">
        <span>and other ministers present.</span>
      </div>
    </div>

  </div>
        </div>

        {/* VIEW RECEPTION PROGRAMME BUTTON */}
        <button
          type="button"
          className="reception-button"
          onClick={() => setPage('reception')}
        >
          VIEW RECEPTION PROGRAMME
        </button>

        {/* BACK TO WELCOME */}
        <button
          type="button"
          className="back-button"
          onClick={() => setPage('welcome')}
        >
          ← BACK
        </button>

      </div>

    </section>
  )}


  {/* =========================
      RECEPTION PROGRAMME PAGE
  ========================= */}

  {page === 'reception' && (
    <section className="reception-page">
      <div className="reception-frame"></div>

      <div className="reception-content">
        <h1>RECEPTION</h1>
        <h2>MARY & PRINCE</h2>

        <p className="reception-date">
          SATURDAY · 14 NOVEMBER 2026
        </p>

        <div className="programme-divider"></div>

        <h3 className="programme-section-title">
          ORDER OF EVENTS
        </h3>

        <div className="reception-list">
          <div className="service-item">
            <span className="service-number">01</span>
            <span className="service-event">Arrival of Guests</span>
          </div>

          <div className="service-item">
            <span className="service-number">02</span>
            <span className="service-event">Introduction of Dignitaries</span>
          </div>

          <div className="service-item">
            <span className="service-number">03</span>
            <span className="service-event">Entrance of the Groom and Bride’s Family</span>
          </div>

          <div className="service-item">
            <span className="service-number">04</span>
            <span className="service-event">Entrance of the Couple</span>
          </div>

          <div className="service-item">
            <span className="service-number">05</span>
            <span className="service-event">Opening Prayer</span>
          </div>

          <div className="service-item">
            <span className="service-number">06</span>
            <span className="service-event">Chairman’s Opening Remark</span>
          </div>

          <div className="service-item">
            <span className="service-number">07</span>
            <div className="service-event">
              <strong>Special Dance:</strong>
              <ul className="dance-list">
                <li>Bride’s Mums / Groom’s Mum</li>
                <li>Bride’s Dads / Groom’s Dad</li>
              </ul>
            </div>
          </div>

          <div className="service-item">
            <span className="service-number">08</span>
            <span className="service-event">Second Entrance</span>
          </div>

          <div className="service-item">
            <span className="service-number">09</span>
            <span className="service-event">Couple’s First Dance</span>
          </div>

          <div className="service-item">
            <span className="service-number">10</span>
            <span className="service-event">Cutting of the Cake</span>
          </div>

          <div className="service-item">
            <span className="service-number">11</span>
            <span className="service-event">Game</span>
          </div>

          <div className="service-item">
            <span className="service-number">12</span>
            <span className="service-event">Dance with Friends and Families</span>
          </div>

          <div className="service-item">
            <span className="service-number">13</span>
            <span className="service-event">Refreshment</span>
          </div>

          <div className="service-item">
            <span className="service-number">14</span>
            <span className="service-event">Closing Remark</span>
          </div>

          <div className="service-item">
            <span className="service-number">15</span>
            <span className="service-event">Closing Prayer</span>
          </div>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => setPage('programme')}
        >
          ← BACK TO ORDER OF THE DAY
        </button>
      </div>
    </section>
  )}


  
      {/* WEDDING GALLERY PAGE */}
      {page === 'gallery' && (
        <WeddingGallery
          onBack={() => setPage('welcome')}
        />
      )}

      <footer className="site-footer">
        <div className="footer-inner">

          <div className="footer-wedding">
            <p className="footer-couple">Mary <span>&amp;</span> Prince</p>
            <p className="footer-date">14 NOVEMBER 2026 · ABUJA</p>
          </div>

          <div className="footer-contact">
            <span>WEBSITE BY</span>
            <strong>EMMANUEL PRINCE</strong>
            <a href="tel:+2348132025732">+234 813 202 5732</a>
          </div>

        </div>
      </footer>
    </main>
  )

}

export default App