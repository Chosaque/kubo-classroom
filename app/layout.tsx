import type { Metadata } from 'next';
import './globals.css';
import './live-extra.css';
import './pastel.css';
import './mobile.css';
import './beginner.css';
import './welcome.css';
import './desk-lesson.css';
import './context-tools.css';
import './prompt-lesson.css';
import './permission-lesson.css';
import './lesson-layout.css';
import './injection-lesson.css';
import './token-lesson.css';
import './language.css';
import './thai-font.css';
import './agent-team.css';
import './lesson-intro.css';
import './midnight-library.css';
export const metadata: Metadata = { title:'Kubo Classroom — Designing an Agent Team', description:'A visual presentation about reusable specialist agents, central orchestration, delegation, and verified results.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}

