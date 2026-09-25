import React, { useRef, useState } from 'react';
import { PDCAExport, PorteeExport } from '../data/schema';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ExportBarProps {
  state: ModuleSessionState;
  onImport: (imported: PDCAExport) => void;
  onResumeDraft?: () => void;
  onResetDraft?: () => void;
  hasDraftAvailable?: boolean;
  draftDate?: string;
  isSaving?: boolean;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  state,
  onImport,
  onResumeDraft,
  onResetDraft,
  hasDraftAvailable,
  draftDate,
  isSaving = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = pdcaCore.importJSON(content);
      if (res.valid && res.data) {
        setImportMessage({
          type: 'success',
          text: `Import réussi : Module ${res.data.application}, Cycle N°${res.data.cycle?.numero || 1}`
        });
        onImport(res.data);
      } else {
        setImportMessage({
          type: 'error',
          text: res.error || 'Fichier JSON invalide pour le schéma PDCA v1.1'
        });
      }
      setTimeout(() => setImportMessage(null), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportJSON = (portee: PorteeExport) => {
    const exportData = pdcaCore.buildExport(state, portee);
    pdcaCore.exportJSON(exportData);
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    const exportData = pdcaCore.buildExport(state, 'cycle');
    const md = pdcaCore.syntheseMarkdown(exportData);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synthese_${state.application}_${state.pseudo}_c${state.cycleNumero}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    const exportData = pdcaCore.buildExport(state, 'cycle');
    pdcaCore.exportCSV(exportData);
    setShowExportMenu(false);
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-xl p-3 sm:p-4 mb-6 shadow-md border border-slate-800">
      {/* Alerte brouillon si présent */}
      {hasDraftAvailable && (
        <div className="mb-3 p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Un brouillon local a été trouvé {draftDate ? `(sauvegardé le ${new Date(draftDate).toLocaleString('fr-FR')})` : ''}.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onResumeDraft && (
              <button
                type="button"
                onClick={onResumeDraft}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium cursor-pointer"
              >
                Reprendre le brouillon
              </button>
            )}
            {onResetDraft && (
              <button
                type="button"
                onClick={onResetDraft}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
              >
                Recommencer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message d'import */}
      {importMessage && (
        <div
          className={`mb-3 p-2.5 rounded-lg flex items-center gap-2 text-xs ${
            importMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-700'
              : 'bg-rose-950/90 text-rose-200 border border-rose-700'
          }`}
        >
          {importMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{importMessage.text}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Info module & cycle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-bold border border-slate-700">
            {state.application}
          </span>
          <span className="text-slate-300">
            Participant : <strong className="text-white">{state.pseudo || 'Anonyme'}</strong>
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300">
            Cycle N°<strong className="text-white">{state.cycleNumero || 1}</strong>
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] ml-1">
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{isSaving ? 'Sauvegarde...' : 'Sauvegardé localement'}</span>
          </div>
        </div>

        {/* Boutons d'export et d'import */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Importer un fichier JSON de résultat PDCA"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Importer JSON</span>
          </button>

          {/* Menu Export */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter...</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-1.5 text-slate-200 space-y-1">
                <button
                  type="button"
                  onClick={() => handleExportJSON('cycle')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="font-medium text-white">JSON Cycle complet</span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-900/60 px-1.5 py-0.5 rounded">
                    Recommandé
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportJSON('etape')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>JSON Étape actuelle</span>
                  <span className="text-[10px] text-slate-400">Étape seule</span>
                </button>
                <div className="border-t border-slate-700 my-1"></div>
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Synthèse Markdown (.md)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tableau des KPI (.csv)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
