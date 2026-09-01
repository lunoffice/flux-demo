import { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import type { ReportBanner } from '../../types/api';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/cn';

type PendingImage = {
  fileName: string;
  ext: string;
  bytesBase64: string;
  previewDataUrl: string;
};

function yearsHint(b: ReportBanner) {
  return b.from === b.to ? String(b.from) : `${b.from} – ${b.to}`;
}

export function GestioneBannerModal({ onClose }: { onClose: () => void }) {
  const [banners, setBanners] = useState<ReportBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [anniInput, setAnniInput] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [editing, setEditing] = useState<ReportBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReportBanner | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    if (!window.api?.reportBanners) {
      setError('API non disponibile.');
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await window.api.reportBanners.list();
    if (!res.ok) {
      setError(res.error ?? 'Errore caricamento');
      setBanners([]);
    } else {
      setError(null);
      setBanners(res.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditing(null);
    setAnniInput('');
    setPendingImage(null);
  }

  function startEdit(b: ReportBanner) {
    setEditing(b);
    setAnniInput(b.from === b.to ? String(b.from) : `${b.from}-${b.to}`);
    setPendingImage(null);
    setError(null);
  }

  async function handlePickImage() {
    if (!window.api?.reportBanners) return;
    setError(null);
    const res = await window.api.reportBanners.pickImage();
    if (!res.ok) {
      setError(res.error ?? 'Errore selezione file');
      return;
    }
    if (res.data?.canceled || !res.data?.bytesBase64 || !res.data.ext) return;
    setPendingImage({
      fileName: res.data.fileName || `banner.${res.data.ext}`,
      ext: res.data.ext,
      bytesBase64: res.data.bytesBase64,
      previewDataUrl: res.data.previewDataUrl || '',
    });
  }

  async function handleSave() {
    if (!window.api?.reportBanners) return;
    if (!anniInput.trim()) {
      setError('Indica gli anni (es. 2024, 2024-2026 o 2021,2023).');
      return;
    }
    if (!editing && !pendingImage) {
      setError('Carica un’immagine JPG o PNG.');
      return;
    }

    setSaving(true);
    setError(null);

    const res = editing
      ? await window.api.reportBanners.update(editing.id, {
          anniInput: anniInput.trim(),
          ...(pendingImage
            ? { bytesBase64: pendingImage.bytesBase64, ext: pendingImage.ext }
            : {}),
        })
      : await window.api.reportBanners.create({
          anniInput: anniInput.trim(),
          bytesBase64: pendingImage!.bytesBase64,
          ext: pendingImage!.ext,
          fileName: pendingImage!.fileName,
        });

    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? 'Errore salvataggio');
      return;
    }
    resetForm();
    await load();
  }

  async function handleDelete() {
    if (!window.api?.reportBanners || !deleteTarget) return;
    setDeleting(true);
    const res = await window.api.reportBanners.delete(deleteTarget.id);
    setDeleting(false);
    if (!res.ok) {
      setError(res.error ?? 'Errore eliminazione');
      setDeleteTarget(null);
      return;
    }
    if (editing?.id === deleteTarget.id) resetForm();
    setDeleteTarget(null);
    await load();
  }

  const previewSrc = pendingImage?.previewDataUrl || editing?.previewDataUrl;

  return (
    <>
      <Modal
        title="Gestione banner"
        onClose={onClose}
        icon={<ImagePlus className="h-5 w-5 text-[var(--modal-text)]" />}
        wide
        footerEnd={
          <button
            type="button"
            className="modal-btn-primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? 'Salvataggio…' : editing ? 'Aggiorna banner' : 'Aggiungi banner'}
          </button>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className={cn('ucs-tariffe-form modal-panel !p-0 overflow-hidden', editing && 'is-editing')}>
            <div className="ucs-tariffe-form-head">
              <div className="ucs-tariffe-form-icon" aria-hidden="true">
                {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="ucs-tariffe-form-title">
                  {editing ? 'Modifica banner' : 'Nuovo banner'}
                </p>
                <p className="ucs-tariffe-form-meta">
                  {editing
                    ? 'Aggiorna annualità o sostituisci l’immagine usata nei report.'
                    : 'Associa un’immagine JPG/PNG alle annualità Fondo Povertà dei report.'}
                </p>
              </div>
              {editing ? (
                <button type="button" className="ucs-tariffe-form-cancel" onClick={resetForm}>
                  Annulla
                </button>
              ) : null}
            </div>

            <div className="ucs-tariffe-form-body">
              <div className="banner-form-grid">
                <Input
                  label="Annualità"
                  value={anniInput}
                  onChange={(e) => setAnniInput(e.target.value)}
                  placeholder="es. 2024-2026"
                />
                <div className="ui-field-wrap">
                  <div className="ui-field-label-row">
                    <span className="ui-field-label">Immagine</span>
                  </div>
                  <div className="ui-field-control">
                    <button
                      type="button"
                      className="banner-form-upload-btn"
                      onClick={() => void handlePickImage()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{pendingImage || editing ? 'Cambia file' : 'Carica JPG / PNG'}</span>
                    </button>
                  </div>
                  {pendingImage ? (
                    <span className="banner-form-upload-file">{pendingImage.fileName}</span>
                  ) : null}
                </div>
              </div>

              {previewSrc ? (
                <div className="banner-form-preview">
                  <img src={previewSrc} alt="Anteprima banner" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="ucs-tariffe-catalog modal-panel !p-0 overflow-hidden">
            <div className="ucs-tariffe-catalog-head">
              <div className="min-w-0">
                <p className="ucs-tariffe-catalog-title">Catalogo banner</p>
                <p className="ucs-tariffe-catalog-meta">
                  Usati in automatico nei report Word e PDF in base all’anno Fondo
                </p>
              </div>
              <span className="ucs-tariffe-catalog-count">
                {loading ? '…' : `${banners.length}`}
              </span>
            </div>

            {loading ? (
              <p className="ucs-tariffe-empty">Caricamento…</p>
            ) : banners.length === 0 ? (
              <p className="ucs-tariffe-empty">
                Nessun banner. Aggiungine uno oppure verranno usati quelli del file Basi (se presente).
              </p>
            ) : (
              <ul className="banner-catalog-list">
                {banners.map((b) => (
                  <li
                    key={b.id}
                    className={cn('banner-catalog-row', editing?.id === b.id && 'is-editing')}
                  >
                    <div className="banner-catalog-thumb" aria-hidden="true">
                      {b.previewDataUrl ? (
                        <img src={b.previewDataUrl} alt="" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-[var(--muted)]" />
                      )}
                    </div>
                    <div className="banner-catalog-info">
                      <span className="banner-catalog-title">Annualità {yearsHint(b)}</span>
                      <span className="banner-catalog-meta">
                        {b.ext.toUpperCase()} · {b.anniLabel}
                      </span>
                    </div>
                    <div className="banner-catalog-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Modifica"
                        aria-label={`Modifica banner ${yearsHint(b)}`}
                        onClick={() => startEdit(b)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="icon-btn is-danger"
                        title="Elimina"
                        aria-label={`Elimina banner ${yearsHint(b)}`}
                        onClick={() => setDeleteTarget(b)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      {deleteTarget && (
        <ConfirmDialog
          title="Elimina banner"
          message={`Eliminare il banner per l’annualità ${yearsHint(deleteTarget)}?`}
          confirmLabel="Elimina"
          variant="danger"
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
