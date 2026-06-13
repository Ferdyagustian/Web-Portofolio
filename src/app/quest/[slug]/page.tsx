import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuestBySlug, getDifficultyColor, getDifficultyLabel, getStatusDisplay, QUEST_PROJECTS } from "../../../lib/questData";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for all quests
export async function generateStaticParams() {
  return QUEST_PROJECTS.map((p) => ({ slug: p.slug }));
}

// Generate SEO metadata per quest
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const quest = getQuestBySlug(slug);
  if (!quest) return { title: "Quest Not Found" };
  return {
    title: `Quest: ${quest.title} | Ferdy Agustian Portfolio`,
    description: quest.description,
  };
}

export default async function QuestDetailPage({ params }: Props) {
  const { slug } = await params;
  const quest = getQuestBySlug(slug);

  if (!quest) notFound();

  const diffColor = getDifficultyColor(quest.difficulty);
  const statusInfo = getStatusDisplay(quest.status);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0f0a",
        color: "#faf3e0",
        fontFamily: "var(--font-pixelify), monospace",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Scanline overlay (inherited from layout) */}

      {/* Background texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(45,90,39,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139,90,43,0.06) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.015) 31px, rgba(255,255,255,0.015) 32px)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* === TOP NAV BAR === */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "2px solid rgba(255,255,255,0.06)",
            backgroundColor: "rgba(13,15,10,0.9)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Link
            href="/#projects"
            className="quest-back-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "rgba(250,243,224,0.6)",
              textDecoration: "none",
              fontFamily: "var(--font-sixtyfour), cursive",
              fontSize: "0.6rem",
              letterSpacing: "1px",
              transition: "color 0.2s",
            }}
          >
            ← QUEST BOARD
          </Link>

          <div
            style={{
              fontFamily: "var(--font-sixtyfour), cursive",
              fontSize: "0.55rem",
              color: "#fbbf24",
              letterSpacing: "2px",
              textShadow: "2px 2px 0px #000",
            }}
          >
            ⚔ QUEST LOG
          </div>

          {/* Status badge */}
          <span
            style={{
              fontFamily: "var(--font-sixtyfour), cursive",
              fontSize: "0.5rem",
              padding: "4px 10px",
              backgroundColor: statusInfo.color + "22",
              color: statusInfo.color,
              border: `2px solid ${statusInfo.color}55`,
              letterSpacing: "1px",
            }}
          >
            {statusInfo.label}
          </span>
        </nav>

        {/* === HERO SECTION === */}
        <header
          style={{
            padding: "48px 24px 40px",
            maxWidth: "900px",
            margin: "0 auto",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Quest number */}
          <div
            style={{
              fontFamily: "var(--font-sixtyfour), cursive",
              fontSize: "0.55rem",
              color: "rgba(251,191,36,0.5)",
              letterSpacing: "3px",
              marginBottom: "12px",
            }}
          >
            #{String(QUEST_PROJECTS.indexOf(quest) + 1).padStart(2, "0")} · {quest.duration}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-sixtyfour), cursive",
              fontSize: "clamp(1rem, 3vw, 1.6rem)",
              color: "#faf3e0",
              lineHeight: 1.5,
              textShadow: "3px 3px 0px #000",
              marginBottom: "24px",
            }}
          >
            {quest.title}
          </h1>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            {/* Difficulty */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-sixtyfour), cursive",
                  fontSize: "0.5rem",
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "1px",
                }}
              >
                DIFFICULTY
              </span>
              <div style={{ display: "flex", gap: "3px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: i < quest.difficulty ? diffColor : "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(0,0,0,0.4)",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sixtyfour), cursive",
                  fontSize: "0.5rem",
                  color: diffColor,
                }}
              >
                {getDifficultyLabel(quest.difficulty)}
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "16px", backgroundColor: "rgba(255,255,255,0.1)" }} />

            {/* Tech stack */}
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {quest.tech_stack.map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontFamily: "var(--font-sixtyfour), cursive",
                    fontSize: "0.5rem",
                    padding: "3px 8px",
                    backgroundColor: "#2d5a27",
                    color: "#fbf8cc",
                    border: "1px solid #1a3a15",
                    letterSpacing: "0.5px",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* GitHub / Live links */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {quest.github_url && (
              <a
                href={quest.github_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "var(--font-sixtyfour), cursive",
                  fontSize: "0.6rem",
                  padding: "8px 16px",
                  backgroundColor: "#1a1a2e",
                  color: "#fbf8cc",
                  border: "2px solid rgba(255,255,255,0.2)",
                  textDecoration: "none",
                  boxShadow: "3px 3px 0px #000",
                  letterSpacing: "1px",
                  transition: "transform 0.1s, box-shadow 0.1s",
                }}
              >
                [GITHUB] →
              </a>
            )}
            {quest.live_url && (
              <a
                href={quest.live_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "var(--font-sixtyfour), cursive",
                  fontSize: "0.6rem",
                  padding: "8px 16px",
                  backgroundColor: "#2d5a27",
                  color: "#fbf8cc",
                  border: "2px solid #4ade80",
                  textDecoration: "none",
                  boxShadow: "3px 3px 0px #000",
                  letterSpacing: "1px",
                }}
              >
                [LIVE DEMO] →
              </a>
            )}
          </div>
        </header>

        {/* === MAIN CONTENT === */}
        <main
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          {/* --- OVERVIEW --- */}
          <QuestSection icon="📜" title="OVERVIEW">
            <p style={{ lineHeight: 1.8, color: "rgba(250,243,224,0.85)", fontSize: "0.95rem" }}>
              {quest.questContent.overview}
            </p>
          </QuestSection>

          {/* --- JOURNEY / TIMELINE --- */}
          <QuestSection icon="🗺" title="PERJALANAN PEMBUATAN">
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {quest.questContent.journey.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: "16px",
                    paddingBottom: "32px",
                    position: "relative",
                  }}
                >
                  {/* Timeline line */}
                  {i < quest.questContent.journey.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "32px",
                        bottom: 0,
                        width: "2px",
                        backgroundColor: "rgba(74,222,128,0.2)",
                        backgroundImage: "repeating-linear-gradient(to bottom, rgba(74,222,128,0.3) 0px, rgba(74,222,128,0.3) 4px, transparent 4px, transparent 8px)",
                      }}
                    />
                  )}
                  {/* Node */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: "#2d5a27",
                      border: "2px solid #4ade80",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontFamily: "var(--font-sixtyfour), cursive",
                      fontSize: "0.5rem",
                      color: "#4ade80",
                      boxShadow: "2px 2px 0px #000",
                      zIndex: 1,
                      position: "relative",
                    }}
                  >
                    {i + 1}
                  </div>
                  {/* Content */}
                  <div style={{ paddingTop: "4px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-sixtyfour), cursive",
                        fontSize: "0.65rem",
                        color: "#fbbf24",
                        marginBottom: "8px",
                        letterSpacing: "0.5px",
                        textShadow: "2px 2px 0px #000",
                      }}
                    >
                      {step.phase}
                    </div>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: "rgba(250,243,224,0.75)",
                        lineHeight: 1.7,
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </QuestSection>

          {/* --- MEDIA / EVIDENCE --- */}
          {quest.questContent.media.length > 0 && (
            <QuestSection icon="🎬" title="BUKTI & DOKUMENTASI">
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {quest.questContent.media.map((item, i) => (
                  <div key={i}>
                    {item.type === "youtube" ? (
                      <div>
                        <div
                          style={{
                            position: "relative",
                            paddingTop: "56.25%",
                            backgroundColor: "#000",
                            border: "3px solid rgba(255,255,255,0.08)",
                            boxShadow: "4px 4px 0px #000",
                          }}
                        >
                          <iframe
                            src={item.url}
                            title={item.caption}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                          />
                        </div>
                        <p
                          style={{
                            marginTop: "8px",
                            fontSize: "0.75rem",
                            color: "rgba(250,243,224,0.45)",
                            fontStyle: "italic",
                          }}
                        >
                          {item.caption}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.caption}
                          style={{
                            width: "100%",
                            border: "3px solid rgba(255,255,255,0.08)",
                            boxShadow: "4px 4px 0px #000",
                            imageRendering: "pixelated",
                          }}
                        />
                        <p
                          style={{
                            marginTop: "8px",
                            fontSize: "0.75rem",
                            color: "rgba(250,243,224,0.45)",
                            fontStyle: "italic",
                          }}
                        >
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </QuestSection>
          )}

          {/* --- CHALLENGES --- */}
          <QuestSection icon="⚠" title="TANTANGAN">
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {quest.questContent.challenges.map((c, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    fontSize: "0.88rem",
                    color: "rgba(250,243,224,0.8)",
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "#f87171", flexShrink: 0 }}>■</span>
                  {c}
                </li>
              ))}
            </ul>
          </QuestSection>

          {/* --- LEARNINGS --- */}
          <QuestSection icon="💡" title="YANG DIPELAJARI">
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {quest.questContent.learnings.map((l, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    fontSize: "0.88rem",
                    color: "rgba(250,243,224,0.8)",
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: "#4ade80", flexShrink: 0 }}>■</span>
                  {l}
                </li>
              ))}
            </ul>
          </QuestSection>

          {/* --- REWARDS --- */}
          <QuestSection icon="⚔" title="REWARDS DIPEROLEH">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {quest.questContent.rewards.map((r) => (
                <span
                  key={r}
                  style={{
                    fontFamily: "var(--font-sixtyfour), cursive",
                    fontSize: "0.6rem",
                    padding: "6px 14px",
                    backgroundColor: "rgba(74,222,128,0.1)",
                    color: "#4ade80",
                    border: "2px solid rgba(74,222,128,0.3)",
                    letterSpacing: "0.5px",
                    boxShadow: "2px 2px 0px #000",
                  }}
                >
                  + {r}
                </span>
              ))}
            </div>
          </QuestSection>

          {/* --- QUEST COMPLETE BANNER --- */}
          {quest.status === "completed" && (
            <div
              style={{
                marginTop: "48px",
                padding: "24px",
                border: "3px solid #4ade80",
                backgroundColor: "rgba(74,222,128,0.05)",
                boxShadow: "4px 4px 0px #000, 0 0 30px rgba(74,222,128,0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sixtyfour), cursive",
                  fontSize: "1rem",
                  color: "#4ade80",
                  textShadow: "3px 3px 0px #000, 0 0 20px rgba(74,222,128,0.5)",
                  letterSpacing: "3px",
                  marginBottom: "8px",
                }}
              >
                ✦ QUEST COMPLETE ✦
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(74,222,128,0.6)",
                }}
              >
                Kamu telah menyelesaikan membaca quest log ini.
              </p>
            </div>
          )}

          {/* Back to board */}
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href="/#projects"
              style={{
                fontFamily: "var(--font-sixtyfour), cursive",
                fontSize: "0.6rem",
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "rgba(250,243,224,0.5)",
                border: "2px solid rgba(255,255,255,0.12)",
                textDecoration: "none",
                letterSpacing: "1px",
                display: "inline-block",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              ← KEMBALI KE QUEST BOARD
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

// Reusable section wrapper
function QuestSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "48px" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
          paddingBottom: "10px",
          borderBottom: "2px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <h2
          style={{
            fontFamily: "var(--font-sixtyfour), cursive",
            fontSize: "0.7rem",
            color: "#fbbf24",
            letterSpacing: "2px",
            textShadow: "2px 2px 0px #000",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {/* Decorative line */}
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "linear-gradient(90deg, rgba(251,191,36,0.3), transparent)",
          }}
        />
      </div>
      {children}
    </section>
  );
}
