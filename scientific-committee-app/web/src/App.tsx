import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useScope } from './components/ui';
import DashboardPage from './pages/Dashboard';
import RegulationsPage from './pages/Regulations';
import SourceDetailPage from './pages/SourceDetail';
import RequirementsPage from './pages/Requirements';
import TemplatesPage from './pages/Templates';
import RequestsPage from './pages/Requests';
import RequestDetailPage from './pages/RequestDetail';
import StudyPage from './pages/Study';
import MinutesPage from './pages/Minutes';
import MinutesDetailPage from './pages/MinutesDetail';
import SettingsPage from './pages/Settings';

const NAV = [
  { to: '/', label: 'اللوحة الرئيسية', end: true },
  { to: '/requests', label: 'الطلبات' },
  { to: '/regulations', label: 'مكتبة اللوائح' },
  { to: '/requirements', label: 'مراجعة المتطلبات' },
  { to: '/templates', label: 'النماذج' },
  { to: '/minutes', label: 'المحاضر' },
  { to: '/settings', label: 'الإعدادات' },
];

export default function App() {
  const { scope, setScope } = useScope();

  return (
    <div className="app">
      <nav className="sidebar" aria-label="القائمة الرئيسية">
        <div className="brand">
          <h1>مقرر اللجنة العلمية</h1>
          <p>جامعة الجوف — كلية العلوم الطبية التطبيقية</p>
          <p>قسم علوم المختبرات الإكلينيكية</p>
        </div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="main">
        <header className="topbar">
          <span className="small muted">النطاق:</span>
          <div className="scope-switch" role="group" aria-label="اختيار النطاق">
            <button type="button" className={scope === 'real' ? 'active' : ''} onClick={() => setScope('real')}>
              العمل الفعلي
            </button>
            <button type="button" className={scope === 'demo' ? 'active demo' : ''} onClick={() => setScope('demo')}>
              عرض تجريبي
            </button>
          </div>
          <span className="spacer" />
          <span className="small muted">تشغيل محلي لمستخدم واحد — بلا دخول متعدد المستخدمين</span>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/studies/:id" element={<StudyPage />} />
            <Route path="/regulations" element={<RegulationsPage />} />
            <Route path="/regulations/:id" element={<SourceDetailPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/minutes" element={<MinutesPage />} />
            <Route path="/minutes/:id" element={<MinutesDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
