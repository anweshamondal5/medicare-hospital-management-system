import React, { useState } from 'react';
import api from '../services/api';
import {
  Database,
  Play,
  Clock,
  CheckCircle2,
  Layers,
  Code2,
  Table,
  Copy,
  Check,
  Sparkles,
  Info
} from 'lucide-react';

interface QueryResult {
  queryKey: string;
  dbmsConcept: string;
  description: string;
  sqlQuery: string;
  executionTimeMs: number;
  rowCount: number;
  data: any[];
}

export const DBMSExplorerPage: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('inner-join-appointments');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const queryOptions = [
    {
      key: 'inner-join-appointments',
      title: '1. Multi-Table INNER JOIN',
      concept: 'INNER JOIN (4 Relational Entities)',
      desc: 'Retrieves active patient appointments joined with demographic, specialist, and department tables.'
    },
    {
      key: 'left-join-doctors',
      title: '2. LEFT OUTER JOIN with COUNT',
      concept: 'LEFT JOIN + GROUP BY',
      desc: 'Aggregates total consultations per physician, including newly registered doctors with zero visits.'
    },
    {
      key: 'group-by-having-departments',
      title: '3. GROUP BY with HAVING Filter',
      concept: 'HAVING Clause Aggregation',
      desc: 'Filters clinical departments where total scheduled and completed consultations meet or exceed threshold.'
    },
    {
      key: 'subquery-above-average-fee',
      title: '4. Nested Scalar Subquery',
      concept: 'Subquery with Comparison Operator',
      desc: 'Dynamically compares doctor fees against the dynamically calculated mean fee of all hospital physicians.'
    },
    {
      key: 'correlated-subquery-exists',
      title: '5. Correlated Subquery with EXISTS',
      concept: 'EXISTS Predicate Evaluation',
      desc: 'Identifies patients with open unsettled invoices using an correlated inner query.'
    },
    {
      key: 'aggregate-frequent-medicines',
      title: '6. Bridge Join Table Aggregation',
      concept: 'Many-to-Many Join & Frequency Count',
      desc: 'Analyzes the prescription items join table to determine the most frequently prescribed pharmaceuticals.'
    },
    {
      key: 'view-patient-appointment',
      title: '7. SQL View: patient_appointment_view',
      concept: 'Database Abstracted View',
      desc: 'Queries the persistent relational reporting view defined in PostgreSQL schema.'
    },
    {
      key: 'view-low-stock',
      title: '8. SQL View: low_stock_medicines_view',
      concept: 'Inventory Warning View',
      desc: 'Executes automated low stock alerting logic encapsulated inside the database view.'
    },
    {
      key: 'view-monthly-revenue',
      title: '9. SQL View: monthly_revenue_view',
      concept: 'Financial Aggregate View',
      desc: 'Summarizes gross versus collected hospital receipts by calendar month.'
    }
  ];

  const handleExecute = async (keyToRun = selectedKey) => {
    setIsExecuting(true);
    try {
      const res = await api.get(`/queries/execute/${keyToRun}`);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to execute DBMS query', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopySql = () => {
    if (!result?.sqlQuery) return;
    navigator.clipboard.writeText(result.sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic DBMS Query Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Viva Showcase
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Interactive console demonstrating relational algebra, joins, subqueries, group by, views, and execution profiling
          </p>
        </div>
      </div>

      {/* Query Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Query List */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block px-1">
            Select DBMS Query Demonstration
          </span>
          <div className="space-y-1.5">
            {queryOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setSelectedKey(opt.key);
                  handleExecute(opt.key);
                }}
                className={`w-full text-left p-3 rounded-2xl border transition text-xs flex flex-col gap-1 ${
                  selectedKey === opt.key
                    ? 'bg-teal-50/80 border-teal-300 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{opt.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {opt.concept}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Output and SQL viewer */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800">
                Active Query: <strong className="text-teal-700">{queryOptions.find((q) => q.key === selectedKey)?.title}</strong>
              </span>
            </div>
            <button
              onClick={() => handleExecute(selectedKey)}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition disabled:opacity-50"
            >
              {isExecuting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Execute on PostgreSQL</span>
            </button>
          </div>

          {result ? (
            <div className="space-y-4">
              {/* Query Metrics Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span className="text-slate-500">Execution Time:</span>
                    <strong className="font-mono text-slate-900">{result.executionTimeMs} ms</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-500">Result Cardinality:</span>
                    <strong className="font-mono text-slate-900">{result.rowCount} rows</strong>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Concept: {result.dbmsConcept}
                </span>
              </div>

              {/* SQL Syntax Viewer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-2 text-teal-400">
                    <Code2 className="w-4 h-4" /> PostgreSQL Executable DML/Query
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto selection:bg-teal-800">
                  {result.sqlQuery}
                </pre>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Execution Result Dataset ({result.rowCount} Rows)
                  </h3>
                  <span className="text-[11px] text-slate-400">PostgreSQL 18 Instance</span>
                </div>

                <div className="overflow-x-auto max-h-96">
                  {result.data.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Query returned empty relation (0 rows).
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200 sticky top-0">
                        <tr>
                          {Object.keys(result.data[0]).map((col) => (
                            <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                        {result.data.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/70">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                                {val === null ? (
                                  <span className="text-slate-400 italic">NULL</span>
                                ) : typeof val === 'object' ? (
                                  JSON.stringify(val)
                                ) : (
                                  String(val)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 text-slate-400">
              <Database className="w-12 h-12 mx-auto text-teal-600/40" />
              <p className="text-sm font-semibold text-slate-600">
                Click "Execute on PostgreSQL" or pick any query on the left to run it live.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The query executes in the PostgreSQL relational database and displays execution timing, returned records, and SQL syntax.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
