import type { VisitorStats } from "../../types/app";
const VisitorStatistics = ({ stats }: { stats: VisitorStats }) => {
  return (
    <div className="visitor-stats">
      <div className="stats-header">
        <h2>إحصائيات الزوار</h2>
        <p>عرض أرقام الزوار ومصادرهم</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalVisitors.toLocaleString()}</h3>
            <p>إجمالي الزوار</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayVisitors.toLocaleString()}</h3>
            <p>زوار اليوم</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-content">
            <h3>{stats.uniqueVisitors.toLocaleString()}</h3>
            <p>زوار فريدون</p>
          </div>
        </div>
      </div>

      <div className="sources-section">
        <h3>أهم مصادر الزوار</h3>
        <div className="sources-list">
          {stats.topSources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-info">
                <span className="source-name">{source.source}</span>
                <span className="source-count">{source.count} زائر</span>
              </div>
              <div
                className="source-bar"
                style={{
                  width: `${
                    (source.count /
                      Math.max(...stats.topSources.map((s) => s.count))) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="countries-section">
        <h3>أهم البلدان</h3>
        <div className="countries-list">
          {stats.topCountries.map((country, index) => (
            <div key={index} className="country-item">
              <span className="country-flag">{country.country}</span>
              <span className="country-count">{country.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-visitors">
        <h3>الزوار الحاليون</h3>
        <div className="visitors-table">
          <table>
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المصدر</th>
                <th>البلد</th>
                <th>الصفحة</th>
              </tr>
            </thead>
            <tbody>
              {stats.visitorsData.slice(0, 10).map((visitor) => (
                <tr key={visitor.id}>
                  <td>
                    {new Date(visitor.timestamp).toLocaleTimeString("ar-SA")}
                  </td>
                  <td>{visitor.source}</td>
                  <td>{visitor.country}</td>
                  <td>{visitor.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorStatistics;

