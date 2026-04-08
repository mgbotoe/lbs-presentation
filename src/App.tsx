import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PresenterView } from './routes/PresenterView';
import { PowerUserView } from './routes/PowerUserView';
import { AudienceView } from './routes/AudienceView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PresenterView />} />
        <Route path="/poweruser" element={<PowerUserView />} />
        <Route path="/audience" element={<AudienceView />} />
      </Routes>
    </BrowserRouter>
  );
}
