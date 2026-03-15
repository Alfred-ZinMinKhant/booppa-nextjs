'use client'

import { useState } from 'react'
import { config, endpoints } from '@/lib/config'

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const res = await fetch(
        `${config.apiUrl}/api/v1${endpoints.marketplace.importCsv}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      )

      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.detail || data.error || 'Import failed')
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl font-bold mb-2">Import Vendors</h1>
          <p className="text-[#94a3b8]">Upload a CSV file to import vendors into the marketplace directory.</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Upload Card */}
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] mb-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">CSV Upload</h2>

            <div className="mb-6">
              <p className="text-sm text-[#64748b] mb-4">
                Expected CSV columns: <code className="text-xs bg-[#f1f5f9] px-1 py-0.5 rounded">companyName, domain, website, industry, country, city, shortDescription, uen, entityType, registrationDate</code>
              </p>
              <label
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e2e8f0] rounded-xl cursor-pointer hover:border-[#10b981] transition-colors"
              >
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="text-center">
                    <p className="font-medium text-[#0f172a]">{file.name}</p>
                    <p className="text-sm text-[#64748b]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[#64748b]">Click to select CSV file</p>
                    <p className="text-sm text-[#94a3b8]">or drag and drop</p>
                  </div>
                )}
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Importing...' : 'Import CSV'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">Import Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#f8fafc] rounded-xl">
                  <div className="text-2xl font-bold text-[#0f172a]">{result.total_rows || 0}</div>
                  <div className="text-sm text-[#64748b]">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-[#10b981]/5 rounded-xl">
                  <div className="text-2xl font-bold text-[#10b981]">{result.inserted || 0}</div>
                  <div className="text-sm text-[#64748b]">Inserted</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{result.updated || 0}</div>
                  <div className="text-sm text-[#64748b]">Updated</div>
                </div>
                <div className="text-center p-4 bg-[#f8fafc] rounded-xl">
                  <div className="text-2xl font-bold text-[#64748b]">{result.skipped || 0}</div>
                  <div className="text-sm text-[#64748b]">Skipped</div>
                </div>
              </div>
              {result.errors > 0 && (
                <div className="mt-4 text-sm text-red-600">
                  {result.errors} errors during import
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] mt-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">Generate CSV from ACRA</h2>
            <div className="bg-[#0f172a] text-[#94a3b8] p-4 rounded-xl font-mono text-sm overflow-x-auto">
              <p className="text-[#10b981]"># Download and generate CSV from data.gov.sg ACRA dataset</p>
              <p>python scripts/acra_import.py --out data/acra-import.csv</p>
              <br />
              <p className="text-[#10b981]"># Dry run to preview counts</p>
              <p>python scripts/acra_import.py --dry-run</p>
              <br />
              <p className="text-[#10b981]"># Limit to 1000 rows for testing</p>
              <p>python scripts/acra_import.py --limit 1000 --out data/acra-test.csv</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
