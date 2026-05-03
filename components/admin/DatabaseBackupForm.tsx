"use client";

import { Download, Upload } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import {
  restoreDatabaseAction,
  type DatabaseRestoreState,
} from "@/app/admin/actions/database";
import { Button } from "@/components/ui/button";

const initialState: DatabaseRestoreState = {};

export function DatabaseBackupForm() {
  const [restoreState, restoreAction, isRestoring] = useActionState(
    restoreDatabaseAction,
    initialState,
  );
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [databaseFileName, setDatabaseFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function downloadDatabase() {
    window.location.href = "/admin/database/download";
    setDownloadModalOpen(false);
  }

  function restoreDatabase() {
    formRef.current?.requestSubmit();
    setRestoreModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.25rem] border border-border p-4">
        <h2 className="font-serif text-3xl tracking-[-0.05em]">Download database</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Save a copy of the current SQLite database, including posts, admin users,
          settings, reports, and sessions.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setDownloadModalOpen(true)}
        >
          <Download className="size-4" aria-hidden="true" />
          Download database
        </Button>
      </div>

      <form ref={formRef} action={restoreAction} className="rounded-[1.25rem] border border-border p-4">
        <h2 className="font-serif text-3xl tracking-[-0.05em]">Upload database</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Restore from a SQLite database file. This overwrites the current database
          and sends you back to sign in again.
        </p>
        <label
          htmlFor="database-upload"
          className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-accent/30 px-5 py-8 text-center transition-colors hover:bg-accent/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground/20"
        >
          <span className="grid size-11 place-items-center rounded-full border border-border bg-background">
            <Upload className="size-4" aria-hidden="true" />
          </span>
          <span className="mt-4 text-sm font-medium">
            {databaseFileName ?? "Choose a SQLite database file"}
          </span>
          <span className="mt-2 max-w-sm text-xs text-muted-foreground">
            Accepted formats: .db, .sqlite, or .sqlite3. The upload will be
            validated before Prompt overwrites the current database.
          </span>
          <input
            id="database-upload"
            name="database"
            type="file"
            accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3,application/x-sqlite3"
            className="sr-only"
            required
            onChange={(event) =>
              setDatabaseFileName(event.currentTarget.files?.[0]?.name ?? null)
            }
          />
        </label>
        {restoreState.error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {restoreState.error}
          </p>
        ) : null}
        <Button
          type="button"
          className="mt-4"
          disabled={isRestoring || !databaseFileName}
          onClick={() => setRestoreModalOpen(true)}
        >
          <Upload className="size-4" aria-hidden="true" />
          Upload and overwrite
        </Button>
      </form>

      {downloadModalOpen ? (
        <WarningModal
          title="Download the full database?"
          description="This file contains every post, admin record, IP ban, report, and session record. Store it somewhere private."
          confirmLabel="Download"
          onCancel={() => setDownloadModalOpen(false)}
          onConfirm={downloadDatabase}
        />
      ) : null}

      {restoreModalOpen ? (
        <WarningModal
          title="Overwrite the current database?"
          description="This cannot be undone from inside Prompt. Download a backup first if you need to preserve the current database."
          confirmLabel="Overwrite database"
          destructive
          onCancel={() => setRestoreModalOpen(false)}
          onConfirm={restoreDatabase}
        />
      ) : null}
    </div>
  );
}

function WarningModal({
  title,
  description,
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 px-5 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="database-warning-title"
        className="w-full max-w-md rounded-[2rem] border border-border bg-background p-6 shadow-xl"
      >
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          Database
        </p>
        <h2
          id="database-warning-title"
          className="mt-4 font-serif text-4xl tracking-[-0.05em]"
        >
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "default" : "outline"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
