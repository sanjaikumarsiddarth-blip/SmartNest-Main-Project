import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/shared/EmptyState';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import { History, ArrowRight, Clock } from 'lucide-react';

export const SearchHistoryPage = () => {
  const { sessionId } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await api.getSearchHistory(sessionId);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load search history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handleViewResults = (params) => {
    navigate('/buyer/recommendations');
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0' }}>
      <div className="container-main">
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-display" style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '6px' }}>
            Search History
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)' }}>
            Review and rerun past lifestyle queries and parameters
          </p>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : history.length > 0 ? (
          <div className="smartnest-card" style={{ overflowX: 'auto', padding: '16px' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Search Summary</th>
                  <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Date Executed</th>
                  <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Results Found</th>
                  <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.history_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="var(--teal)" />
                        {item.summary}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                      <span className="badge-pill badge-teal">{item.results_count} listings</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewResults(item.params)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        View Results <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={History}
            heading="No search history yet"
            subtext="Take the lifestyle quiz or use the natural language AI search to generate your personal search records."
            actionText="Take Lifestyle Quiz"
            onAction={() => navigate('/buyer/quiz')}
          />
        )}
      </div>
    </div>
  );
};
